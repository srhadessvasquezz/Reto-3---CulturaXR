import { useEffect, useRef } from 'react';

interface CameraFeedProps {
  stream: MediaStream | null;
  mirrored?: boolean;
  // Ref externa opcional al <video> (p. ej. para capturar el frame). Se
  // combina con la ref interna sin alterar el manejo del srcObject.
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export function CameraFeed({ stream, mirrored = true, videoRef }: CameraFeedProps) {
  const internalRef = useRef<HTMLVideoElement | null>(null);

  // Ref combinada: alimenta la ref interna (usada por el efecto de srcObject)
  // y, si se pasó, también la externa.
  const setRefs = (el: HTMLVideoElement | null): void => {
    internalRef.current = el;
    if (videoRef) videoRef.current = el;
  };

  useEffect(() => {
    const video = internalRef.current;
    if (!video) return;
    video.srcObject = stream;
    return () => { video.srcObject = null; };
  }, [stream]);

  if (!stream) return null;

  return (
    <video
      ref={setRefs}
      className={mirrored ? 'camera-feed camera-feed--mirrored' : 'camera-feed'}
      autoPlay
      muted
      playsInline
    />
  );
}
