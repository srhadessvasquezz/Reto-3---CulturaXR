import { useState, useRef, useEffect } from 'react';
import { useModelDetail } from '../hooks/useModels';
import { useCamera } from '../hooks/useCamera';
import { ModelViewer } from './ModelViewer';
import { CameraSelector } from './CameraSelector';
import { CameraFeed } from './CameraFeed';
import { HandOverlay } from './HandOverlay';
import { InfoPanel } from './InfoPanel';
import { GestureMonitor } from './GestureMonitor';
import { PhotoCaptureFlow } from './PhotoCaptureFlow';
import { ActionMenu } from './ActionMenu';
import { MODEL_INFO } from '../data/modelInfo';
import type { GestureCommand, GestureData } from '../types';

interface ImmersiveExperienceProps {
  modelId: string;
  onClose: () => void;
}

// La cámara y MediaPipe viven dentro de este componente: useCamera pide
// getUserMedia al montarse y detiene el stream al desmontarse, así que
// abrir/cerrar la experiencia enciende/apaga la webcam.
export function ImmersiveExperience({ modelId, onClose }: ImmersiveExperienceProps) {
  const { model } = useModelDetail(modelId);
  const camera = useCamera();
  const gestureRef = useRef<GestureData | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  // Cambiar esta key remonta ModelViewer → reinicia la posición del modelo
  // sin tocar ModelViewer (que queda inmutable).
  const [modelKey, setModelKey] = useState(0);

  // Ubicación del sitio (subtítulo de la ficha) para el overlay superior.
  const location = MODEL_INFO[modelId]?.subtitle ?? '';

  // Espejo de showCapture leíble desde el intervalo sin cerrar sobre estado
  // obsoleto, y último comando visto para detectar el flanco de subida.
  const showCaptureRef = useRef(false);
  showCaptureRef.current = showCapture;
  const prevCommandRef = useRef<GestureCommand>('NONE');

  // Polling de gestos (flanco de subida; el comando llega repetido cada frame):
  // - 4 dedos (TAKE_PHOTO) → abre el flujo de foto (igual que el botón 📷).
  // - 3 dedos (PREVIOUS_MODEL, hoy sin acción) → abre/cierra el menú de acciones.
  // No se modifica el detector de gestos: solo se consumen comandos existentes.
  useEffect(() => {
    const id = setInterval(() => {
      const command = gestureRef.current?.command ?? 'NONE';
      const prev = prevCommandRef.current;

      if (command === 'TAKE_PHOTO' && prev !== 'TAKE_PHOTO' && !showCaptureRef.current) {
        setShowCapture(true);
      }

      if (command === 'PREVIOUS_MODEL' && prev !== 'PREVIOUS_MODEL' && !showCaptureRef.current) {
        setShowMenu((v) => !v);
      }

      prevCommandRef.current = command;
    }, 100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="immersive-overlay">
      <section className="app-viewer immersive-viewer">
        <CameraFeed stream={camera.stream} videoRef={videoRef} />
        <ModelViewer
          key={modelKey}
          model={model}
          gestureRef={gestureRef}
          onCanvasReady={(c) => { threeCanvasRef.current = c; }}
        />

        <div className="immersive-frame" aria-hidden="true">
          <span className="immersive-frame__band immersive-frame__band--top" />
          <span className="immersive-frame__band immersive-frame__band--bottom" />
          <span className="immersive-frame__band immersive-frame__band--left" />
          <span className="immersive-frame__band immersive-frame__band--right" />
        </div>

        <div className="site-overlay">
          <p className="site-overlay__name">{model?.name ?? ''}</p>
          {location && <p className="site-overlay__location">{location}</p>}
        </div>
        <HandOverlay
          stream={camera.stream}
          onGesture={(data) => {
            // isFrozen es autoridad de ModelViewer (lo escribe en la ref).
            // HandOverlay crea un objeto nuevo por frame, así que lo
            // preservamos aquí para que no se pierda entre escrituras.
            const prev = gestureRef.current;
            data.isFrozen = prev ? prev.isFrozen : false;
            gestureRef.current = data;
          }}
        />

        <GestureMonitor gestureRef={gestureRef} />

        <InfoPanel
          modelId={modelId}
          open={showInfo}
          onClose={() => setShowInfo(false)}
        />

        {camera.loading && (
          <p className="viewer-status">Activando cámara…</p>
        )}
        {camera.error && (
          <p className="viewer-status viewer-status--error">
            {camera.error}
          </p>
        )}

        <div className="immersive-actions">
          <CameraSelector
            cameras={camera.cameras}
            selectedCamera={camera.selectedCamera}
            onSelect={camera.setSelectedCamera}
          />
          <button
            className="immersive-btn"
            onClick={() => setShowCapture(true)}
            type="button"
          >
            📷 Foto
          </button>
          <button
            className="immersive-btn"
            onClick={() => setShowInfo(v => !v)}
            type="button"
          >
            Ver información
          </button>
          <button className="immersive-btn" onClick={onClose} type="button">
            Volver al menú principal
          </button>
        </div>

        {showCapture && (
          <PhotoCaptureFlow
            videoRef={videoRef}
            threeCanvasRef={threeCanvasRef}
            onClose={() => setShowCapture(false)}
          />
        )}

        {showMenu && (
          <ActionMenu
            onResetModel={() => setModelKey((k) => k + 1)}
            onExit={onClose}
            onClose={() => setShowMenu(false)}
          />
        )}
      </section>
    </div>
  );
}
