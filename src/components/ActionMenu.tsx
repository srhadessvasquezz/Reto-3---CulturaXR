import { useState } from 'react';
import './ActionMenu.css';

interface ActionMenuProps {
  onResetModel: () => void;
  onExit: () => void;
  onClose: () => void;
}

const CLOSE_ANIM_MS = 200;

// Menú de acciones flotante dentro de la experiencia. Se abre/cierra con
// animación suave y se cierra automáticamente tras ejecutar una acción.
export function ActionMenu({ onResetModel, onExit, onClose }: ActionMenuProps) {
  const [closing, setClosing] = useState(false);

  // Reproduce la animación de cierre y luego ejecuta el callback.
  const dismiss = (after: () => void): void => {
    setClosing(true);
    window.setTimeout(after, CLOSE_ANIM_MS);
  };

  const handleReset = (): void => {
    dismiss(() => {
      onResetModel();
      onClose();
    });
  };

  // Salir desmonta la experiencia completa: no hace falta animar el cierre.
  const handleExit = (): void => {
    onExit();
  };

  const handleBackdrop = (): void => {
    dismiss(onClose);
  };

  return (
    <div
      className={'action-menu-backdrop' + (closing ? ' action-menu-backdrop--closing' : '')}
      onClick={handleBackdrop}
    >
      <div
        className={'action-menu' + (closing ? ' action-menu--closing' : '')}
        onClick={(e) => e.stopPropagation()}
        role="menu"
      >
        <p className="action-menu__title">Acciones</p>
        <button className="action-menu__item" onClick={handleReset} type="button" role="menuitem">
          ↺ Reiniciar posición
        </button>
        <button className="action-menu__item" onClick={handleExit} type="button" role="menuitem">
          ⌂ Volver al menú principal
        </button>
      </div>
    </div>
  );
}
