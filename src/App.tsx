import { useState } from 'react';
import { useModels, useModelDetail } from './hooks/useModels';
import { ModelList } from './components/ModelList';
import { ModelViewer } from './components/ModelViewer';

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { models, loading, error } = useModels();
  const { model: selectedModel } = useModelDetail(selectedId);

  return (
    <div className="app">
      <header className="app-header">
        <h1>CulturaXR</h1>
        <p className="app-header__sub">Explorá El Salvador en 3D</p>
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
          <ModelViewer model={selectedModel} />
        </section>
      </main>
    </div>
  );
}

export default App;
