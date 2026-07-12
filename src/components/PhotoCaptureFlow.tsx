import { useEffect, useState } from 'react';
import { captureFrame } from '../utils/captureFrame';
import { downloadPng } from '../utils/downloadPng';
import './PhotoCaptureFlow.css';

interface PhotoCaptureFlowProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  threeCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  onClose: () => void;
}

type Phase = 'countdown' | 'flash' | 'preview' | 'idle';

const FLASH_DURATION_MS = 200;

// Encapsula todo el flujo de captura: cuenta regresiva (3→2→1), flash blanco,
// captura del frame y vista previa con descarga. La cámara y el modelo 3D
// nunca se desmontan: este componente es solo una capa CSS por encima.
export function PhotoCaptureFlow({ videoRef, threeCanvasRef, onClose }: PhotoCaptureFlowProps) {
  const [phase, setPhase] = useState<Phase>('countdown');
  const [countdown, setCountdown] = useState<number>(3);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);

  // Cuenta regresiva: un segundo exacto por número.
  useEffect(() => {
    if (phase !== 'countdown') return;
    const id = setInterval(() => {
      setCountdown((n) => n - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Al agotarse el contador, pasar a la fase de flash.
  useEffect(() => {
    if (phase === 'countdown' && countdown <= 0) {
      setPhase('flash');
    }
  }, [phase, countdown]);

  // Durante el flash: esperar a que sea visible, capturar el frame y mostrar
  // la vista previa. Si no hay frame válido, cerrar sin previsualizar.
  useEffect(() => {
    if (phase !== 'flash') return;
    let cancelled = false;

    const run = async (): Promise<void> => {
      const video = videoRef.current;
      const canvas = threeCanvasRef.current;
      const dataUrl = video && canvas ? await captureFrame(video, canvas) : '';
      if (cancelled) return;
      if (!dataUrl) {
        onClose();
        return;
      }
      setCapturedDataUrl(dataUrl);
      setPhase('preview');
    };

    const timer = setTimeout(() => { void run(); }, FLASH_DURATION_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phase, videoRef, threeCanvasRef, onClose]);

  const handleDownload = (): void => {
    if (capturedDataUrl) {
      downloadPng(capturedDataUrl, 'culturaxr.png');
    }
  };

  if (phase === 'idle') return null;

  if (phase === 'countdown') {
    return <div className="capture-countdown">{countdown}</div>;
  }

  if (phase === 'flash') {
    return <div className="capture-flash" />;
  }

  // phase === 'preview'
  return (
    <div className="capture-preview">
      {capturedDataUrl && (
        <img
          className="capture-preview__image"
          src={capturedDataUrl}
          alt="Captura CULTURAXR"
        />
      )}
      <div className="capture-preview__actions">
        <button className="immersive-btn" onClick={handleDownload} type="button">
          Descargar
        </button>
        <button className="immersive-btn" onClick={onClose} type="button">
          Volver
        </button>
      </div>
    </div>
  );
}
