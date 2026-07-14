import { useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { GestureCommand, GestureData } from '../types';
import { classifyGesture, countExtendedFingers, type Handedness } from '../utils/gestureDetectors';

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

const COLORS: Record<string, string> = { Left: '#00FFFF', Right: '#FF6B6B' };
const PINCH_THRESHOLD = 0.065;
const FREEZE_DEBOUNCE_FRAMES = 8;

function drawHand(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  color: string,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.7;
  for (const [i, j] of CONNECTIONS) {
    const a = pts[i], b = pts[j];
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  for (const p of pts) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function isPinching(lm: { x: number; y: number; z: number }[]): boolean {
  return Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y) < PINCH_THRESHOLD;
}

interface HandOverlayProps {
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  mirrored?: boolean;
  onGesture?: (data: GestureData) => void;
}

export function HandOverlay({ stream, videoRef, mirrored = true, onGesture }: HandOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let handLandmarker: HandLandmarker | null = null;
    let running = true;
    let callbackId: number | null = null;

    // Estado clasificación persistente entre frames
    let rawPrev: GestureCommand = 'NONE';
    let freezeFrames = 0;
    let freezeArmed = true;

    // Dimensiones precalculadas (una vez, sin lecturas DOM en el bucle)
    let cw = 0, ch = 0, rw = 0, rh = 0, ox = 0, oy = 0;
    let dimsReady = false;

    async function init() {
      const $canvas = canvas;
      if (!$canvas) return;

      try {
        const wasmBase = new URL('./mediapipe/wasm/', window.location.href).href;
        const vision = await FilesetResolver.forVisionTasks(wasmBase);

        const modelPath = new URL('./mediapipe/hand_landmarker.task', window.location.href).href;
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelPath,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.4,
          minHandPresenceConfidence: 0.4,
          minTrackingConfidence: 0.4,
        });
      } catch (err) {
        console.warn('[SivAR] Error inicializando hand landmarker:', err);
        return;
      }

      if (!running || !video) return;

      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;

      const parent = $canvas.parentElement!;
      cw = parent.clientWidth;
      ch = parent.clientHeight;
      $canvas.width = cw;
      $canvas.height = ch;

      const scale = Math.max(cw / vw, ch / vh);
      rw = vw * scale;
      rh = vh * scale;
      ox = (cw - rw) / 2;
      oy = (ch - rh) / 2;
      dimsReady = true;

      scheduleFrame();
    }

    function scheduleFrame() {
      if (!running || !video || !handLandmarker || !dimsReady) return;

      if (typeof video.requestVideoFrameCallback === 'function') {
        callbackId = video.requestVideoFrameCallback(processFrame);
      } else {
        callbackId = window.setTimeout(() => processFrame(performance.now()), 0);
      }
    }

    function cancelFrame() {
      if (callbackId === null || !video) return;
      if (typeof video.cancelVideoFrameCallback === 'function') {
        video.cancelVideoFrameCallback(callbackId);
      } else {
        clearTimeout(callbackId);
      }
      callbackId = null;
    }

    function processFrame(now: DOMHighResTimeStamp) {
      if (!running || !handLandmarker || !video) return;

      const results = handLandmarker.detectForVideo(video, now);
      ctx.clearRect(0, 0, cw, ch);

      const gesture: GestureData = {
        command: 'NONE',
        hand1: { active: false, sx: 0, sy: 0 },
        hand2: { active: false, sx: 0, sy: 0 },
        hand1FingersExtended: 0,
        hand2FingersExtended: 0,
        isFrozen: false,
        commandConsumed: true,
      };

      let hand1Lm: { x: number; y: number; z: number }[] | null = null;
      let hand2Lm: { x: number; y: number; z: number }[] | null = null;
      let hand1Label: Handedness | undefined;
      let hand2Label: Handedness | undefined;

      if (results.landmarks && results.landmarks.length > 0) {
        for (let i = 0; i < results.landmarks.length; i++) {
          const lm = results.landmarks[i];
          const label = results.handedness?.[i]?.[0]?.categoryName ?? `Hand ${i}`;
          const color = COLORS[label] ?? '#888';
          const typedLabel: Handedness | undefined =
            label === 'Left' || label === 'Right' ? label : undefined;

          const pts = lm.map((p) => ({
            x: mirrored ? (1 - p.x) * rw + ox : p.x * rw + ox,
            y: p.y * rh + oy,
          }));

          drawHand(ctx, pts, color);

          const pinching = isPinching(lm);
          const pinchSx = (pts[4].x + pts[8].x) / 2;
          const pinchSy = (pts[4].y + pts[8].y) / 2;

          if (i === 0) {
            gesture.hand1 = { active: pinching, sx: pinchSx, sy: pinchSy };
            hand1Lm = lm;
            hand1Label = typedLabel;
          } else if (i === 1) {
            gesture.hand2 = { active: pinching, sx: pinchSx, sy: pinchSy };
            hand2Lm = lm;
            hand2Label = typedLabel;
          }
        }
      }

      // Clasificación de comandos
      const raw = classifyGesture(hand1Lm, hand2Lm, rawPrev, hand1Label, hand2Label);
      rawPrev = raw;

      const pinching = gesture.hand1.active || gesture.hand2.active;
      const command: GestureCommand = pinching ? 'NONE' : raw;

      let commandConsumed = true;
      if (command === 'TOGGLE_FREEZE') {
        freezeFrames++;
        if (freezeFrames >= FREEZE_DEBOUNCE_FRAMES && freezeArmed) {
          freezeArmed = false;
          commandConsumed = false;
        }
      } else {
        freezeFrames = 0;
        freezeArmed = true;
      }

      gesture.command = command;
      gesture.hand1FingersExtended = hand1Lm ? countExtendedFingers(hand1Lm, hand1Label, 'hand1') : 0;
      gesture.hand2FingersExtended = hand2Lm ? countExtendedFingers(hand2Lm, hand2Label, 'hand2') : 0;
      gesture.commandConsumed = commandConsumed;

      onGesture?.(gesture);

      if (running && video.readyState >= 2) {
        if (typeof video.requestVideoFrameCallback === 'function') {
          callbackId = video.requestVideoFrameCallback(processFrame);
        } else {
          callbackId = window.setTimeout(() => processFrame(performance.now()), 33);
        }
      }
    }

    if (video.readyState >= 2) {
      init();
    } else {
      video.addEventListener('loadeddata', () => { if (running) init(); }, { once: true });
    }

    return () => {
      running = false;
      cancelFrame();
      if (handLandmarker) {
        handLandmarker.close();
        handLandmarker = null;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [stream, videoRef, mirrored, onGesture]);

  if (!stream) return null;

  return (
    <canvas
      ref={canvasRef}
      className="hand-overlay"
    />
  );
}
