import type { Model3D } from '../hooks/useModels';

interface ModelCardProps {
  model: Model3D;
  selected: boolean;
  onClick: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  arqueología: '#d4a574',
  naturaleza: '#74c69d',
  arquitectura: '#95b8d1',
  arte: '#c77dff',
  playa: '#f4a261',
};

export function ModelCard({ model, selected, onClick }: ModelCardProps) {
  const badgeColor = CATEGORY_COLORS[model.category] || '#888';

  return (
    <button
      className={`model-card${selected ? ' model-card--selected' : ''}`}
      onClick={onClick}
      type="button"
    >
      <div className="model-card__preview">
        <span className="model-card__placeholder">3D</span>
      </div>
      <div className="model-card__body">
        <span
          className="model-card__category"
          style={{ backgroundColor: badgeColor }}
        >
          {model.category}
        </span>
        <h3 className="model-card__title">{model.name}</h3>
        <p className="model-card__desc">{model.description}</p>
      </div>
    </button>
  );
}
