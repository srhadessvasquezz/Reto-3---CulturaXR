import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows, Environment } from '@react-three/drei';
import type { Model3DDetail } from '../hooks/useModels';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

function Placeholder() {
  return (
    <mesh rotation={[-0.5, 0.5, 0]}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#00d4aa" wireframe />
    </mesh>
  );
}

interface ModelViewerProps {
  model: Model3DDetail | null;
}

export function ModelViewer({ model }: ModelViewerProps) {
  return (
    <div className="model-viewer">
      {model && (
        <div className="model-viewer__info">
          <h2>{model.name}</h2>
          <p>{model.description}</p>
        </div>
      )}

      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />

        <Suspense fallback={<Placeholder />}>
          {model ? (
            <Model url={model.file} />
          ) : (
            <Placeholder />
          )}
          <ContactShadows position={[0, -2, 0]} opacity={0.4} blur={2} />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls enablePan={false} enableZoom={true} />
      </Canvas>
    </div>
  );
}
