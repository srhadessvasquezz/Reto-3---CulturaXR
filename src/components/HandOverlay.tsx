import { useEffect, useRef } from 'react';
import type { GestureData } from '../types';

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
  mirrored?: boolean;
  onGesture?: (data: GestureData) => void;
}

export function HandOverlay({ stream, mirrored = true, onGesture }: HandOverlayProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const hidden = document.createElement('video');
    hidden.setAttribute('playsinline', '');
    hidden.muted = true;
    hidden.srcObject = stream;
    videoRef.current = hidden;
    hidden.play();

    return () => {
      hidden.srcObject = null;
      hidden.remove();
    };
  }, [stream]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stream) return;

    const $video = videoRef.current!;
    const $canvas = canvas;
    const $ctx = canvas.getContext('2d')!;
    let handsInstance: any = null;
    let animationId: number | null = null;
    let running = true;

    async function waitForHands(): Promise<boolean> {
      for (let i = 0; i < 100; i++) {
        if (!running) return false;
        if ((window as any).Hands) return true;
        await new Promise((r) => setTimeout(r, 200));
      }
      return false;
    }

    async function init() {
      const ready = await waitForHands();
      if (!ready || !running) return;

      await $video.play();

      const vw = $video.videoWidth || 640;
      const vh = $video.videoHeight || 480;

      const parent = $canvas.parentElement!;
      $canvas.width = parent.clientWidth;
      $canvas.height = parent.clientHeight;

      const cw = $canvas.width;
      const ch = $canvas.height;

      const scale = Math.max(cw / vw, ch / vh);
      const rw = vw * scale;
      const rh = vh * scale;
      const ox = (cw - rw) / 2;
      const oy = (ch - rh) / 2;

      const Hands = (window as any).Hands;
      handsInstance = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      handsInstance.setOptions({
        maxNumHands: 2,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      handsInstance.onResults((results: any) => {
        if (!running) return;
        $ctx.clearRect(0, 0, cw, ch);

        const gesture: GestureData = {
          hand1: { active: false, sx: 0, sy: 0 },
          hand2: { active: false, sx: 0, sy: 0 },
        };

        if (results.multiHandLandmarks) {
          for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            const lm = results.multiHandLandmarks[i];
            const hand = results.multiHandedness[i]?.label ?? `Hand ${i}`;
            const color = COLORS[hand] ?? '#888';

            const pts = lm.map((p: any) => ({
              x: mirrored ? (1 - p.x) * rw + ox : p.x * rw + ox,
              y: p.y * rh + oy,
            }));

            drawHand($ctx, pts, color);

            const pinching = isPinching(lm);
            const pinchSx = (pts[4].x + pts[8].x) / 2;
            const pinchSy = (pts[4].y + pts[8].y) / 2;

            if (i === 0) {
              gesture.hand1 = { active: pinching, sx: pinchSx, sy: pinchSy };
            } else if (i === 1) {
              gesture.hand2 = { active: pinching, sx: pinchSx, sy: pinchSy };
            }
          }
        }

        onGesture?.(gesture);
      });

      let busy = false;
      async function tick() {
        if (!running) return;
        if (!busy && $video.readyState >= 2) {
          busy = true;
          try { await handsInstance.send({ image: $video }); } catch {}
          busy = false;
        }
        animationId = requestAnimationFrame(tick);
      }

      tick();
    }

    init();

    return () => {
      running = false;
      if (animationId !== null) cancelAnimationFrame(animationId);
      if (handsInstance) handsInstance.close();
      $ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    };
  }, [stream, mirrored, onGesture]);

  if (!stream) return null;

  return (
    <canvas
      ref={canvasRef}
      className="hand-overlay"
    />
  );
}
