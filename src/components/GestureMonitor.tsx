import { useEffect, useState } from 'react';
import type { GestureCommand, GestureData } from '../types';

const COMMAND_LABELS: Record<GestureCommand, string> = {
  NONE: '👋 Esperando gesto...',
  TOGGLE_FREEZE: '🖐️ PALMA ABIERTA (AMBAS)',
  SHOW_INFO: '☝️ 1 DEDO (INFORMACIÓN)',
  NEXT_MODEL: '✌️ 2 DEDOS (SIGUIENTE)',
  PREVIOUS_MODEL: '🖌️ 3 DEDOS (ANTERIOR)',
  MENU_TOGGLE: '🖐️ 4 DEDOS (MENÚ)',
  TAKE_PHOTO: '📷 4 DEDOS (FOTO)',
};

interface GestureMonitorProps {
  gestureRef: React.RefObject<GestureData | null>;
}

// Lee gestureRef por polling (~10 Hz) y solo actualiza estado cuando cambia,
// para no re-renderizar el resto de la experiencia a 60fps.
export function GestureMonitor({ gestureRef }: GestureMonitorProps) {
  const [command, setCommand] = useState<GestureCommand>('NONE');
  const [isFrozen, setIsFrozen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const g = gestureRef.current;
      const cmd = g?.command ?? 'NONE';
      const frozen = g?.isFrozen ?? false;
      setCommand((prev) => (prev === cmd ? prev : cmd));
      setIsFrozen((prev) => (prev === frozen ? prev : frozen));
    }, 100);
    return () => clearInterval(id);
  }, [gestureRef]);

  return (
    <div className="gesture-monitor">
      <div className="gesture-monitor__command">{COMMAND_LABELS[command]}</div>
      <div
        className={
          'gesture-monitor__status' +
          (isFrozen ? ' gesture-monitor__status--frozen' : '')
        }
      >
        {isFrozen ? '⏸️ MODELO CONGELADO' : '▶️ MODELO ACTIVO'}
      </div>
    </div>
  );
}
