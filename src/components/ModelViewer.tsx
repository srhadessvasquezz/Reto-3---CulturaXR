import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { Model3DDetail } from '../hooks/useModels';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Modelos .glb pueden venir en cualquier escala/origen. En vez de
    // hardcodear scale/position (no hay forma de verlo antes de la demo),
    // se auto-encuadra: mide el bounding box, lo reescala a ~3 unidades
    // y lo centra en el origen.
    const box = new THREE.Box3().setFromObject(ref.current);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    ref.current.scale.setScalar(3 / maxDim);

    const scaledBox = new THREE.Box3().setFromObject(ref.current);
    const center = scaledBox.getCenter(new THREE.Vector3());
    ref.current.position.sub(center);
  }, [scene]);

  return <primitive ref={ref} object={scene} rotation={[0, 0, 0]} />;
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
        </Suspense>

        <OrbitControls enablePan={false} enableZoom={true} />
      </Canvas>
    </div>
  );
}
