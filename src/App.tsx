import { useState, useRef } from 'react';
import { useModels, useModelDetail } from './hooks/useModels';
import { useCamera } from './hooks/useCamera';
import { ModelList } from './components/ModelList';
import { ModelViewer } from './components/ModelViewer';
import { CameraSelector } from './components/CameraSelector';
import { CameraFeed } from './components/CameraFeed';
import { HandOverlay } from './components/HandOverlay';
import type { GestureData } from './types';

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { models, loading, error } = useModels();
  const { model: selectedModel } = useModelDetail(selectedId);
  const camera = useCamera();
  const gestureRef = useRef<GestureData | null>(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>CulturaXR</h1>
        <p className="app-header__sub">Explorá El Salvador en 3D</p>
        <CameraSelector
          cameras={camera.cameras}
          selectedCamera={camera.selectedCamera}
          onSelect={camera.setSelectedCamera}
        />
      </header>

      <main className="app-main">
        <aside className="app-sidebar">
          <ModelList
            models={models}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={loading}
            error={error}
          />
        </aside>

        <section className="app-viewer">
          <CameraFeed stream={camera.stream} />
          <ModelViewer model={selectedModel} gestureRef={gestureRef} />
          <HandOverlay
            stream={camera.stream}
            onGesture={(data) => { gestureRef.current = data; }}
          />
          {camera.loading && (
            <p className="viewer-status">Activando cámara…</p>
          )}
          {camera.error && (
            <p className="viewer-status viewer-status--error">
              {camera.error}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
