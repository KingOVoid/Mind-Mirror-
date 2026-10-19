import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// STATIONERY PALETTE
// ─────────────────────────────────────────────────────────────────────────────
const PEN_BARREL_CHARCOAL = '#1E293B';
const PEN_BARREL_SAGE = '#3F5E48';
const PEN_NIB_STEEL = '#E2E8F0';
const PEN_CLIP_CHROME = '#CBD5E1';
const PEN_INK_BLUE = '#1E3A8A';

const PENCIL_YELLOW = '#EAB308';
const PENCIL_SAGE = '#4D7C5B';
const PENCIL_WOOD = '#FDE68A';
const PENCIL_GRAPHITE = '#0F172A';
const PENCIL_ERASER = '#FB7185';
const PENCIL_FERRULE = '#CBD5E1';

const STAPLER_BODY = '#1E293B';
const STAPLER_STEEL = '#94A3B8';
const STAPLER_BASE = '#334155';

const CLIP_SILVER = '#E2E8F0';
const CLIP_GOLD = '#F59E0B';

// ─────────────────────────────────────────────────────────────────────────────
// 1. FOUNTAIN PEN (Lamy Safari / Pilot Kaküno Style)
// ─────────────────────────────────────────────────────────────────────────────
interface FountainPenProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  barrelColor: string;
  speed: number;
  phase: number;
}

function FountainPen({ position, rotation = [0, 0, 0], scale = 1, barrelColor, speed, phase }: FountainPenProps) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * speed;

    groupRef.current.position.y = position[1] + Math.sin(t + phase) * 0.35;
    groupRef.current.position.x = position[0] + Math.cos(t * 0.7 + phase) * 0.2;

    groupRef.current.rotation.x += delta * 0.025;
    groupRef.current.rotation.y += delta * 0.035;
    groupRef.current.rotation.z += delta * 0.015;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Faceted Barrel (Lamy Safari 8-sided flat barrel) */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.12, 0.1, 1.4, 8]} />
        <meshStandardMaterial color={barrelColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Ink Window (two oblong viewports showing blue ink) */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.118, 0.118, 0.12, 8]} />
        <meshStandardMaterial color={PEN_INK_BLUE} roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Ergonomic Contoured Grip Section */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.09, 0.115, 0.5, 3]} />
        <meshStandardMaterial color={barrelColor} roughness={0.5} />
      </mesh>

      {/* Steel Nib (Triangular nib with breathing slit) */}
      <mesh position={[0, 0.75, 0]}>
        <coneGeometry args={[0.07, 0.32, 4]} />
        <meshStandardMaterial color={PEN_NIB_STEEL} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Nib slit */}
      <mesh position={[0, 0.72, 0.035]}>
        <boxGeometry args={[0.008, 0.22, 0.01]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Cap Section (Stationed behind or attached) */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.135, 0.13, 0.7, 8]} />
        <meshStandardMaterial color={barrelColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Signature Safari Spring-Loaded Wire Clip */}
      <mesh position={[0.14, -1.48, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.02, 0.5, 0.03]} />
        <meshStandardMaterial color={PEN_CLIP_CHROME} metalness={0.95} roughness={0.15} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. HEXAGONAL WOODEN PENCILS
// ─────────────────────────────────────────────────────────────────────────────
interface PencilProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  bodyColor: string;
  speed: number;
  phase: number;
}

function FloatingPencil({ position, rotation = [0, 0, 0], scale = 1, bodyColor, speed, phase }: PencilProps) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * speed;

    groupRef.current.position.y = position[1] + Math.sin(t + phase) * 0.3;
    groupRef.current.position.x = position[0] + Math.sin(t * 0.6 + phase) * 0.2;

    groupRef.current.rotation.z += delta * 0.04;
    groupRef.current.rotation.x += delta * 0.025;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* 6-sided hexagonal barrel */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.085, 0.085, 1.8, 6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.65} />
      </mesh>

      {/* Sharpened cedar wood cone */}
      <mesh position={[0, 1.05, 0]}>
        <coneGeometry args={[0.085, 0.3, 6]} />
        <meshStandardMaterial color={PENCIL_WOOD} roughness={0.8} />
      </mesh>

      {/* Graphite lead tip */}
      <mesh position={[0, 1.25, 0]}>
        <coneGeometry args={[0.032, 0.12, 6]} />
        <meshStandardMaterial color={PENCIL_GRAPHITE} roughness={0.3} metalness={0.3} />
      </mesh>

      {/* Metal ferrule collar */}
      <mesh position={[0, -0.96, 0]}>
        <cylinderGeometry args={[0.088, 0.088, 0.14, 12]} />
        <meshStandardMaterial color={PENCIL_FERRULE} metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Pink rubber eraser */}
      <mesh position={[0, -1.09, 0]}>
        <cylinderGeometry args={[0.084, 0.084, 0.16, 12]} />
        <meshStandardMaterial color={PENCIL_ERASER} roughness={0.9} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DESK STAPLER
// ─────────────────────────────────────────────────────────────────────────────
interface StaplerProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  speed: number;
  phase: number;
}

function FloatingStapler({ position, rotation = [0, 0, 0], scale = 1, speed, phase }: StaplerProps) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * speed;

    groupRef.current.position.y = position[1] + Math.sin(t + phase) * 0.28;
    groupRef.current.rotation.y += delta * 0.02;
    groupRef.current.rotation.x += delta * 0.015;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Base Plate */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[1.5, 0.12, 0.5]} />
        <meshStandardMaterial color={STAPLER_BASE} roughness={0.6} />
      </mesh>

      {/* Metallic Anvil Plate (front of base) */}
      <mesh position={[0.45, -0.08, 0]}>
        <boxGeometry args={[0.25, 0.02, 0.3]} />
        <meshStandardMaterial color={STAPLER_STEEL} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Rubber anti-slip feet underneath */}
      <mesh position={[-0.55, -0.22, 0]}>
        <boxGeometry args={[0.2, 0.04, 0.45]} />
        <meshStandardMaterial color="#0F172A" roughness={0.9} />
      </mesh>
      <mesh position={[0.55, -0.22, 0]}>
        <boxGeometry args={[0.2, 0.04, 0.45]} />
        <meshStandardMaterial color="#0F172A" roughness={0.9} />
      </mesh>

      {/* Steel Magazine Core */}
      <mesh position={[-0.05, 0.08, 0]} rotation={[0, 0, -0.05]}>
        <boxGeometry args={[1.3, 0.2, 0.36]} />
        <meshStandardMaterial color={STAPLER_STEEL} metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Upper Ergonomic Handle / Pusher Cap */}
      <mesh position={[-0.02, 0.26, 0]} rotation={[0, 0, -0.06]}>
        <boxGeometry args={[1.38, 0.22, 0.44]} />
        <meshStandardMaterial color={STAPLER_BODY} roughness={0.4} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SCATTERED WIRE PAPER CLIPS
// ─────────────────────────────────────────────────────────────────────────────
interface PaperClipProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color: string;
  speed: number;
  phase: number;
}

function FloatingPaperClip({ position, rotation = [0, 0, 0], scale = 1, color, speed, phase }: PaperClipProps) {
  const meshRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;

    meshRef.current.position.y = position[1] + Math.sin(t + phase) * 0.32;
    meshRef.current.rotation.x += delta * 0.035;
    meshRef.current.rotation.y += delta * 0.045;
  });

  return (
    <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
      {/* Outer Long Leg */}
      <mesh position={[-0.1, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.65, 8]} />
        <meshStandardMaterial color={color} metalness={0.92} roughness={0.18} />
      </mesh>

      {/* Outer Bottom Curve */}
      <mesh position={[0, -0.32, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.2, 8]} />
        <meshStandardMaterial color={color} metalness={0.92} roughness={0.18} />
      </mesh>

      {/* Outer Right Leg */}
      <mesh position={[0.1, 0.05, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.75, 8]} />
        <meshStandardMaterial color={color} metalness={0.92} roughness={0.18} />
      </mesh>

      {/* Top Outer Curve */}
      <mesh position={[0.02, 0.42, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.16, 8]} />
        <meshStandardMaterial color={color} metalness={0.92} roughness={0.18} />
      </mesh>

      {/* Inner Return Leg */}
      <mesh position={[-0.04, 0.15, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.45, 8]} />
        <meshStandardMaterial color={color} metalness={0.92} roughness={0.18} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GENTLE GRAPHITE & PAPER PARTICLES
// ─────────────────────────────────────────────────────────────────────────────
function StationeryDustParticles({ count = 60 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, speeds, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const phs = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;

      spd[i] = Math.random() * 0.14 + 0.05;
      phs[i] = Math.random() * Math.PI * 2;
    }

    return { positions: pos, speeds: spd, phases: phs };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const idxY = i * 3 + 1;
      const idxX = i * 3 + 0;

      array[idxY] += speeds[i] * delta * 0.35;
      array[idxX] += Math.sin(time * 0.2 + phases[i]) * 0.002;

      if (array[idxY] > 13) {
        array[idxY] = -13;
        array[idxX] = (Math.random() - 0.5) * 36;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#84CC16"
        transparent
        opacity={0.25}
        depthWrite={false}
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIONERY 3D SCENE
// ─────────────────────────────────────────────────────────────────────────────
function StationeryScene() {
  return (
    <>
      {/* Soft, Warm Sunlight & Sage Ambient Lighting */}
      <directionalLight position={[6, 12, 5]} intensity={1.3} color="#FFF8EB" />
      <ambientLight intensity={0.8} color="#94A895" />
      <directionalLight position={[-6, -4, 2]} intensity={0.35} color="#D8E2D8" />
      <pointLight position={[0, 3, 4]} intensity={0.45} color="#FDE8CD" distance={25} />

      {/* ── 1. FOUNTAIN PENS (Lamy Safari / Pilot Kaküno Inspired) ── */}
      <FountainPen
        position={[-3.6, 2.6, -2.5]}
        rotation={[0.3, 0.4, -0.6]}
        scale={1.2}
        barrelColor={PEN_BARREL_CHARCOAL}
        speed={0.25}
        phase={0.5}
      />
      <FountainPen
        position={[3.6, -2.2, -2.5]}
        rotation={[-0.4, 0.3, 0.7]}
        scale={1.2}
        barrelColor={PEN_BARREL_SAGE}
        speed={0.22}
        phase={3.2}
      />
      <FountainPen
        position={[-5.8, 3.8, -4.2]}
        rotation={[0.2, -0.3, 0.5]}
        scale={1.1}
        barrelColor={PEN_BARREL_CHARCOAL}
        speed={0.2}
        phase={1.4}
      />

      {/* ── 2. HEXAGONAL WOODEN PENCILS ── */}
      <FloatingPencil
        position={[-3.0, -1.8, -1.8]}
        rotation={[0.5, 0.2, 0.9]}
        scale={0.9}
        bodyColor={PENCIL_YELLOW}
        speed={0.28}
        phase={1.8}
      />
      <FloatingPencil
        position={[3.0, 2.4, -1.8]}
        rotation={[-0.3, 0.4, -0.8]}
        scale={0.9}
        bodyColor={PENCIL_SAGE}
        speed={0.26}
        phase={4.5}
      />
      <FloatingPencil
        position={[-1.2, 3.6, -2.0]}
        rotation={[0.4, 0.1, -0.5]}
        scale={0.85}
        bodyColor={PENCIL_YELLOW}
        speed={0.24}
        phase={2.9}
      />

      {/* ── 3. DESK STAPLERS ── */}
      <FloatingStapler
        position={[-3.6, -3.2, -2.4]}
        rotation={[0.2, 0.5, -0.1]}
        scale={1.1}
        speed={0.22}
        phase={2.5}
      />
      <FloatingStapler
        position={[3.8, 1.2, -2.8]}
        rotation={[-0.2, -0.4, 0.2]}
        scale={1.05}
        speed={0.2}
        phase={5.2}
      />

      {/* ── 4. SCATTERED WIRE PAPER CLIPS ── */}
      <FloatingPaperClip
        position={[-1.8, 3.0, -1.5]}
        rotation={[0.2, 0.3, 0.8]}
        scale={1.15}
        color={CLIP_SILVER}
        speed={0.3}
        phase={0.8}
      />
      <FloatingPaperClip
        position={[2.0, 2.8, -1.5]}
        rotation={[-0.4, 0.5, 0.2]}
        scale={1.1}
        color={CLIP_GOLD}
        speed={0.28}
        phase={2.2}
      />
      <FloatingPaperClip
        position={[-2.2, -2.8, -1.5]}
        rotation={[0.6, -0.2, -0.7]}
        scale={1.15}
        color={CLIP_GOLD}
        speed={0.26}
        phase={3.9}
      />
      <FloatingPaperClip
        position={[2.2, -2.8, -1.5]}
        rotation={[-0.3, -0.4, 0.5]}
        scale={1.2}
        color={CLIP_SILVER}
        speed={0.3}
        phase={5.1}
      />
      <FloatingPaperClip
        position={[-3.4, 0.4, -1.8]}
        rotation={[0.3, -0.3, 0.4]}
        scale={1.05}
        color={CLIP_SILVER}
        speed={0.25}
        phase={1.1}
      />
      <FloatingPaperClip
        position={[3.4, -0.5, -1.8]}
        rotation={[-0.5, 0.2, -0.3]}
        scale={1.1}
        color={CLIP_GOLD}
        speed={0.27}
        phase={4.1}
      />

      {/* Ambient Stationery Graphite/Dust Field */}
      <StationeryDustParticles count={65} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FULLSCREEN FIXED CANVAS COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const StationeryBackground: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof window === 'undefined') {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 25%, #FAF7F0 0%, #F3EEE3 55%, #EBE3D3 100%)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 13], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '100%' }}
      >
        <StationeryScene />
      </Canvas>
    </div>
  );
};

export default StationeryBackground;

// Aliases for compatibility
export { StationeryBackground as PhysicalNotebookBackground, StationeryBackground as SpatialZenBackground };
