import { MODEL_INFO } from '../data/modelInfo';

interface InfoPanelProps {
  modelId: string;
  open: boolean;
  onClose: () => void;
}

// Panel lateral con la ficha del sitio. Siempre está montado y entra/sale
// con transform para que la transición CSS funcione en ambas direcciones.
export function InfoPanel({ modelId, open, onClose }: InfoPanelProps) {
  const info = MODEL_INFO[modelId];

  return (
    <aside className={`info-panel${open ? ' info-panel--open' : ''}`}>
      <button
        className="info-panel__close"
        onClick={onClose}
        type="button"
        aria-label="Cerrar información"
      >
        ×
      </button>

      {info ? (
        <>
          <h2 className="info-panel__title">{info.title}</h2>
          <p className="info-panel__subtitle">{info.subtitle}</p>
          {info.paragraphs.map((paragraph, i) => (
            <p key={i} className="info-panel__text">{paragraph}</p>
          ))}
          <p className="info-panel__footer">{info.footer}</p>
        </>
      ) : (
        <p className="info-panel__text">Información no disponible.</p>
      )}
    </aside>
  );
}
