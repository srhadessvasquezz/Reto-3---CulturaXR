import { useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { GestureCommand, GestureData } from '../types';
import { classifyGesture, type Handedness } from '../utils/gestureDetectors';

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

const COLORS: Record<string, string> = { Left: '#00FFFF', Right: '#FF6B6B' };
const PINCH_DIST_SQ = 0.065 * 0.065;
const FREEZE_DEBOUNCE_FRAMES = 8;
const FINGER_TIPS = [4, 8, 12, 16, 20];

// Buffer reutilizable para coordenadas proyectadas (evita alloc por frame)
const scratch: { x: number; y: number }[][] = [[], []];
for (let h = 0; h < 2; h++) for (let i = 0; i < 21; i++) scratch[h].push({ x: 0, y: 0 });

// Pinch: distancia cartesiana al cuadrado entre índice y pulgar.
function pinchActive(lm: { x: number; y: number; z: number }[]): boolean {
  const dx = lm[4].x - lm[8].x;
  const dy = lm[4].y - lm[8].y;
  return dx * dx + dy * dy < PINCH_DIST_SQ;
}

// Conteo directo de dedos extendidos (sin buffer de suavizado).
// Índice, medio, anular, meñique: punta más lejos de la muñeca que la PIP.
// Pulgar: punta más lejos de la MCP (2) que la IP (3).
function countFingers(lm: { x: number; y: number; z: number }[]): number {
  if (!lm || lm.length < 21) return 0;
  let n = 0;
  // Pulgar
  const td1 = (lm[4].x - lm[2].x) ** 2 + (lm[4].y - lm[2].y) ** 2;
  const td2 = (lm[3].x - lm[2].x) ** 2 + (lm[3].y - lm[2].y) ** 2;
  if (td1 > td2) n++;
  // Los otros 4 dedos
  for (let i = 1; i < 5; i++) {
    const tip = FINGER_TIPS[i];
    const pip = tip - 2;
    const dx1 = lm[tip].x - lm[0].x;
    const dy1 = lm[tip].y - lm[0].y;
    const dx2 = lm[pip].x - lm[0].x;
    const dy2 = lm[pip].y - lm[0].y;
    if (dx1 * dx1 + dy1 * dy1 > dx2 * dx2 + dy2 * dy2) n++;
  }
  return n;
}

interface HandOverlayProps {
  stream: MediaStream | null;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  mirrored?: boolean;
  onGesture?: (data: GestureData) => void;
}

export function HandOverlay({ stream, videoRef, mirrored = true, onGesture }: HandOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onGestureRef = useRef(onGesture);
  onGestureRef.current = onGesture;

  useEffect(() => {
    if (!stream) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let handLandmarker: HandLandmarker | null = null;
    let running = true;
    let callbackId: number | null = null;

    let rawPrev: GestureCommand = 'NONE';
    let freezeFrames = 0;
    let freezeArmed = true;

    let cw = 0, ch = 0, rw = 0, rh = 0, ox = 0, oy = 0;
    let dimsReady = false;

    // Auto-throttle: si la inferencia tomó >40ms, saltamos el
    // siguiente frame para no acumular backlog.
    let skipNextFrame = false;

    let videoEl = videoRef?.current ?? null;
    let ownsVideo = false;

    if (!videoEl) {
      videoEl = document.createElement('video');
      videoEl.setAttribute('playsinline', '');
      videoEl.muted = true;
      videoEl.srcObject = stream;
      videoEl.style.display = 'none';
      document.body.appendChild(videoEl);
      ownsVideo = true;
      videoEl.play();
    }

    async function init() {
      const $canvas = canvas;
      if (!$canvas || !videoEl) return;

      try {
        const wasmBase = new URL('./mediapipe/wasm/', window.location.href).href;
        const vision = await FilesetResolver.forVisionTasks(wasmBase);

        const modelPath = new URL('./mediapipe/hand_landmarker.task', window.location.href).href;
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelPath,
            delegate: 'CPU',
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

      if (!running || !videoEl) return;

      const vw = videoEl.videoWidth || 640;
      const vh = videoEl.videoHeight || 480;

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
      if (!running || !videoEl || !handLandmarker || !dimsReady || videoEl.readyState < 2) return;

      if (typeof videoEl.requestVideoFrameCallback === 'function') {
        callbackId = videoEl.requestVideoFrameCallback(processFrame);
      } else {
        callbackId = window.setTimeout(() => processFrame(performance.now()), 0);
      }
    }

    function cancelFrame() {
      if (callbackId === null || !videoEl) return;
      if (typeof videoEl.cancelVideoFrameCallback === 'function') {
        videoEl.cancelVideoFrameCallback(callbackId);
      } else {
        clearTimeout(callbackId);
      }
      callbackId = null;
    }

    function processFrame(now: DOMHighResTimeStamp) {
      if (!running || !handLandmarker || !videoEl) return;

      // Auto-throttle: si la inferencia anterior fue lenta, saltamos
      // este frame. El canvas no se limpia, los landmarks anteriores
      // persisten visualmente.
      if (skipNextFrame) {
        skipNextFrame = false;
        scheduleFrame();
        return;
      }

      const t0 = performance.now();
      const results = handLandmarker.detectForVideo(videoEl, now);
      const elapsed = performance.now() - t0;
      // Si el frame tomó > 40ms (<25fps), saltar el siguiente para
      // no acumular backlog.
      skipNextFrame = elapsed > 40;
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

          // Proyectar landmarks en coordenadas de canvas (sin alloc)
          const buf = scratch[i];
          for (let j = 0; j < 21; j++) {
            const p = lm[j];
            buf[j].x = mirrored ? (1 - p.x) * rw + ox : p.x * rw + ox;
            buf[j].y = p.y * rh + oy;
          }

          // Batch connections: un solo stroke()
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          for (const [ci, cj] of CONNECTIONS) {
            const a = buf[ci], b = buf[cj];
            if (!a || !b) continue;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
          }
          ctx.stroke();

          // Batch landmarks: un solo fill()
          ctx.globalAlpha = 1;
          ctx.fillStyle = color;
          ctx.beginPath();
          for (let j = 0; j < 21; j++) {
            const p = buf[j];
            ctx.moveTo(p.x + 3, p.y);
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          }
          ctx.fill();

          const pinching = pinchActive(lm);
          const pinchSx = (buf[4].x + buf[8].x) / 2;
          const pinchSy = (buf[4].y + buf[8].y) / 2;

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
      gesture.hand1FingersExtended = hand1Lm ? countFingers(hand1Lm) : 0;
      gesture.hand2FingersExtended = hand2Lm ? countFingers(hand2Lm) : 0;
      gesture.commandConsumed = commandConsumed;

      onGestureRef.current?.(gesture);

      scheduleFrame();
    }

    if (videoEl.readyState >= 2) {
      init();
    } else {
      videoEl.addEventListener('loadeddata', () => { if (running) init(); }, { once: true });
    }

    return () => {
      running = false;
      cancelFrame();
      if (handLandmarker) {
        handLandmarker.close();
        handLandmarker = null;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (ownsVideo && videoEl) {
        videoEl.srcObject = null;
        videoEl.remove();
      }
    };
  }, [stream, videoRef, mirrored]);

  if (!stream) return null;

  return (
    <canvas
      ref={canvasRef}
      className="hand-overlay"
    />
  );
}
