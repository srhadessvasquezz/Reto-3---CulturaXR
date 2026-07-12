import { useState, useRef } from 'react';
import { useModelDetail } from '../hooks/useModels';
import { useCamera } from '../hooks/useCamera';
import { ModelViewer } from './ModelViewer';
import { CameraSelector } from './CameraSelector';
import { CameraFeed } from './CameraFeed';
import { HandOverlay } from './HandOverlay';
import { InfoPanel } from './InfoPanel';
import { GestureMonitor } from './GestureMonitor';
import type { GestureData } from '../types';

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
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="immersive-overlay">
      <section className="app-viewer immersive-viewer">
        <CameraFeed stream={camera.stream} />
        <ModelViewer model={model} gestureRef={gestureRef} />
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
            onClick={() => setShowInfo(v => !v)}
            type="button"
          >
            Ver información
          </button>
          <button className="immersive-btn" onClick={onClose} type="button">
            Volver al menú principal
          </button>
        </div>
      </section>
    </div>
  );
}
