import type { ChangeEvent } from 'react';
import type { CameraDevice } from '../hooks/useCamera';

interface CameraSelectorProps {
  cameras: CameraDevice[];
  selectedCamera: string | null;
  onSelect: (deviceId: string) => void;
}

export function CameraSelector({ cameras, selectedCamera, onSelect }: CameraSelectorProps) {
  if (cameras.length < 2) return null;

  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    onSelect(event.target.value);
  };

  return (
    <div className="camera-selector">
      <label className="camera-selector__label" htmlFor="camera-selector-select">
        Cámara
      </label>
      <select
        id="camera-selector-select"
        className="camera-selector__select"
        value={selectedCamera ?? ''}
        onChange={handleChange}
      >
        {cameras.map(camera => (
          <option key={camera.deviceId} value={camera.deviceId}>
            {camera.label}
          </option>
        ))}
      </select>
    </div>
  );
}
