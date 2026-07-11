import type { Model3D } from '../hooks/useModels';
import { ModelCard } from './ModelCard';

interface ModelListProps {
  models: Model3D[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
  error: string | null;
}

export function ModelList({ models, selectedId, onSelect, loading, error }: ModelListProps) {
  if (loading) {
    return (
      <div className="model-list">
        <div className="model-list__status">Cargando modelos…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="model-list">
        <div className="model-list__status model-list__status--error">
          Error: {error}
        </div>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="model-list">
        <div className="model-list__status">
          No hay modelos disponibles. Agregá entradas en <code>server/models.json</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="model-list">
      <h2 className="model-list__heading">Modelos disponibles</h2>
      <div className="model-list__grid">
        {models.map(m => (
          <ModelCard
            key={m.id}
            model={m}
            selected={m.id === selectedId}
            onClick={() => onSelect(m.id)}
          />
        ))}
      </div>
    </div>
  );
}
