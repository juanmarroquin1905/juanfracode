"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// Íconos de apps de cristal flotando. Siguen el mouse con suavidad.
const TILES: { pos: [number, number, number]; color: string; scale: number; rot: [number, number, number] }[] = [
  { pos: [0, 0.1, 0.6], color: "#6d4aff", scale: 1.35, rot: [0.25, -0.5, 0.08] },
  { pos: [-1.75, 0.95, -0.4], color: "#2f6bff", scale: 0.9, rot: [-0.2, 0.6, -0.15] },
  { pos: [1.7, 1.05, -0.2], color: "#22c55e", scale: 0.8, rot: [0.3, -0.3, 0.2] },
  { pos: [-1.45, -1.05, 0.1], color: "#f97316", scale: 0.75, rot: [0.4, 0.4, -0.1] },
  { pos: [1.55, -0.95, 0.3], color: "#eab308", scale: 0.85, rot: [-0.3, -0.6, 0.12] },
  { pos: [0.15, 1.75, -1.2], color: "#ec4899", scale: 0.55, rot: [0.5, 0.2, 0.3] },
];

function Environment() {
  const gl = useThree((st) => st.gl);
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return texture;
  }, [gl]);
  useEffect(() => () => env.dispose(), [env]);
  return <primitive object={env} attach="environment" />;
}

function Tile({ pos, color, scale, rot }: (typeof TILES)[number]) {
  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.7}>
      <group position={pos} rotation={rot} scale={scale}>
        <RoundedBox args={[1, 1, 0.28]} radius={0.22} smoothness={6}>
          <meshPhysicalMaterial
            color={color}
            roughness={0.12}
            metalness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.08}
            transmission={0.35}
            thickness={0.6}
            ior={1.4}
            envMapIntensity={1.2}
          />
        </RoundedBox>
        {/* "pantalla" del ícono */}
        <RoundedBox args={[0.52, 0.12, 0.05]} radius={0.05} position={[0, 0.12, 0.15]}>
          <meshStandardMaterial color="white" roughness={0.3} />
        </RoundedBox>
        <RoundedBox args={[0.34, 0.12, 0.05]} radius={0.05} position={[-0.09, -0.1, 0.15]}>
          <meshStandardMaterial color="white" roughness={0.3} transparent opacity={0.7} />
        </RoundedBox>
      </group>
    </Float>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ pointer }, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, pointer.x * 0.45, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.y * 0.3, 3, delta);
  });
  return <group ref={group}>{children}</group>;
}

export default function AppIconsScene({ onReady }: { onReady?: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      onCreated={() => onReady?.()}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      <Environment />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <directionalLight position={[-4, -2, 2]} intensity={0.6} color="#a5b4fc" />
      <Rig>
        {TILES.map((t, i) => (
          <Tile key={i} {...t} />
        ))}
      </Rig>
    </Canvas>
  );
}
