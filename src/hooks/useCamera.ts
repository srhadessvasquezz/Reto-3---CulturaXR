import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'culturaxr_camera_id';

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export interface UseCameraResult {
  stream: MediaStream | null;
  cameras: CameraDevice[];
  selectedCamera: string | null;
  setSelectedCamera: (deviceId: string) => void;
  error: string | null;
  loading: boolean;
}

function stopStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

function getErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return 'Permiso de cámara denegado. Podés seguir explorando los modelos 3D sin gestos.';
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return 'No se encontró ninguna cámara en este dispositivo.';
    }
    if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      return 'La cámara está siendo usada por otra aplicación.';
    }
  }
  return 'No se pudo acceder a la cámara.';
}

export function useCamera(): UseCameraResult {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCameraState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);

  const startStream = useCallback(async (deviceId: string | null): Promise<void> => {
    setLoading(true);
    setError(null);
    stopStream(streamRef.current);
    streamRef.current = null;
    setStream(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!mountedRef.current) {
        stopStream(mediaStream);
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs: CameraDevice[] = devices
        .filter(device => device.kind === 'videoinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Cámara ${index + 1}`,
        }));

      if (!mountedRef.current) {
        stopStream(mediaStream);
        return;
      }

      const activeId =
        mediaStream.getVideoTracks()[0]?.getSettings().deviceId ?? deviceId ?? null;

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setCameras(videoInputs);
      setSelectedCameraState(activeId);
      if (activeId) {
        localStorage.setItem(STORAGE_KEY, activeId);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(getErrorMessage(err));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const init = async (): Promise<void> => {
      const storedId = localStorage.getItem(STORAGE_KEY);
      let preferredId: string | null = null;

      if (storedId) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const exists = devices.some(
            device => device.kind === 'videoinput' && device.deviceId === storedId
          );
          preferredId = exists ? storedId : null;
        } catch {
          preferredId = null;
        }
      }

      await startStream(preferredId);
    };

    void init();

    return () => {
      mountedRef.current = false;
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, [startStream]);

  const setSelectedCamera = useCallback(
    (deviceId: string) => {
      if (deviceId === selectedCamera) return;
      void startStream(deviceId);
    },
    [selectedCamera, startStream]
  );

  return { stream, cameras, selectedCamera, setSelectedCamera, error, loading };
}
