import { useEffect, useRef } from 'react';

interface CameraFeedProps {
  stream: MediaStream | null;
  mirrored?: boolean;
}

export function CameraFeed({ stream, mirrored = true }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  if (!stream) return null;

  return (
    <div className="camera-feed">
      <video
        ref={videoRef}
        className={mirrored ? 'camera-feed__video camera-feed__video--mirrored' : 'camera-feed__video'}
        autoPlay
        muted
        playsInline
      />
    </div>
  );
}
