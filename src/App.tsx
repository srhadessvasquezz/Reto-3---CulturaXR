import { useEffect, useState } from 'react';
import { ImmersiveExperience } from './components/ImmersiveExperience';

function App() {
  const [modelId, setModelId] = useState<string | null>(null);

  // Listener delegado: cualquier click sobre un elemento con [data-model-id]
  // en la landing estática (index.html) abre la experiencia con ese modelo.
  // Agregar botones nuevos al HTML no requiere tocar React.
  // App nunca se desmonta, así que entrar/salir/entrar funciona sin recargar.
  useEffect(() => {
    if (!document.querySelector('[data-model-id]')) {
      console.warn(
        '[CulturaXR] No se encontró ningún botón con data-model-id en index.html: ' +
        'la experiencia inmersiva no se puede abrir desde la landing.'
      );
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const trigger = target?.closest<HTMLElement>('[data-model-id]');
      if (!trigger) return;
      // Solo los botones de la landing abren la experiencia: se ignoran
      // clicks originados dentro del overlay inmersivo (evita re-aperturas
      // accidentales si algún elemento interno llegara a tener data-model-id).
      if (trigger.closest('.immersive-overlay')) return;
      const id = trigger.dataset.modelId;
      if (id) setModelId(id);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  if (!modelId) return null;

  return (
    <ImmersiveExperience
      modelId={modelId}
      onClose={() => setModelId(null)}
    />
  );
}

export default App;
