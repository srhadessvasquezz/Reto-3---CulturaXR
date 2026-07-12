import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows, Environment } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import type { Group } from 'three';
import type { Model3DDetail } from '../hooks/useModels';
import type { GestureData } from '../types';

const TARGET_SIZE = 3;

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  // Los .glb llegan con tamaño y pivote arbitrarios: se centra la geometría
  // en el origen y se normaliza a TARGET_SIZE para que las rotaciones
  // (mouse y gestos) giren sobre el centro visual del modelo.
  const { offset, scale } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return { offset: center.negate(), scale: TARGET_SIZE / maxDim };
  }, [scene]);

  return (
    <group scale={scale}>
      <primitive object={scene} position={offset} />
    </group>
  );
}

function Placeholder() {
  return (
    <mesh rotation={[-0.5, 0.5, 0]}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#00d4aa" wireframe />
    </mesh>
  );
}

function TransparentBg() {
  const { gl, scene } = useThree();
  useEffect(() => {
    gl.setClearColor(0x000000, 0);
    scene.background = null;
  }, [gl, scene]);
  return null;
}

function GestureControl({
  gestureRef,
  groupRef,
}: {
  gestureRef: React.RefObject<GestureData | null>;
  groupRef: React.RefObject<Group | null>;
}) {
  const controlsRef = useRef<any>(null);
  const prev = useRef({ sx: 0, sy: 0, active: false });
  const twoHand = useRef({ dist: 0, baseScale: 1 });

  useFrame(() => {
    const g = gestureRef.current;
    if (!g) return;

    const anyPinch = g.hand1.active || g.hand2.active;
    if (controlsRef.current) controlsRef.current.enabled = !anyPinch;

    if (!anyPinch) {
      prev.current.active = false;
      twoHand.current.dist = 0;
      return;
    }

    if (g.hand1.active && g.hand2.active) {
      const d = Math.hypot(g.hand2.sx - g.hand1.sx, g.hand2.sy - g.hand1.sy);
      if (twoHand.current.dist === 0) {
        twoHand.current.dist = d;
        twoHand.current.baseScale = groupRef.current?.scale.x ?? 1;
      }
      const s = twoHand.current.baseScale * (d / twoHand.current.dist);
      if (groupRef.current) groupRef.current.scale.setScalar(Math.max(0.3, Math.min(6, s)));
      prev.current.active = false;
    } else if (g.hand1.active) {
      twoHand.current.dist = 0;
      const h = g.hand1;
      if (prev.current.active) {
        const dx = h.sx - prev.current.sx;
        const dy = h.sy - prev.current.sy;
        if (groupRef.current) {
          groupRef.current.rotation.y += dx * 0.005;
          // Se limita la inclinación a ±60° para que un gesto no deje el modelo boca abajo
          groupRef.current.rotation.x = Math.max(
            -Math.PI / 3,
            Math.min(Math.PI / 3, groupRef.current.rotation.x + dy * 0.005),
          );
        }
      }
      prev.current = { sx: h.sx, sy: h.sy, active: true };
    }
  });

  return <OrbitControls ref={controlsRef} enablePan={false} enableZoom={true} />;
}

function ModelScene({
  model,
  gestureRef,
}: {
  model: Model3DDetail | null;
  gestureRef: React.RefObject<GestureData | null>;
}) {
  const groupRef = useRef<Group>(null);

  return (
    <>
      <group ref={groupRef}>
        {model ? <Model url={model.file} /> : <Placeholder />}
      </group>
      <GestureControl gestureRef={gestureRef} groupRef={groupRef} />
    </>
  );
}

interface ModelViewerProps {
  model: Model3DDetail | null;
  gestureRef: React.RefObject<GestureData | null>;
}

export function ModelViewer({ model, gestureRef }: ModelViewerProps) {
  return (
    <div className="model-viewer">
      {model && (
        <div className="model-viewer__info">
          <h2>{model.name}</h2>
          <p>{model.description}</p>
        </div>
      )}

      <Canvas gl={{ alpha: true }} camera={{ position: [0, 0, 5], fov: 50 }}>
        <TransparentBg />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />

        <Suspense fallback={<Placeholder />}>
          <ModelScene model={model} gestureRef={gestureRef} />
          <ContactShadows position={[0, -2, 0]} opacity={0.4} blur={2} />
          <Environment preset="city" background={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
