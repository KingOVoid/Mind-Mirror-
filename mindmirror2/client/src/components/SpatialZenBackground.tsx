import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// SPATIAL ZEN PALETTE (Warm Sandstone, River Stone, Soft Sage & Morning Sunlight)
// ─────────────────────────────────────────────────────────────────────────────
const ZEN_SAGE_LIGHT = '#8FAF8A';
const ZEN_SAGE_DEEP = '#5B8266';
const ZEN_SAGE_MINT = '#A7C4A0';
const ZEN_STONE_SAND = '#D8CDBF';
const ZEN_STONE_SLATE = '#9CAFA3';
const ZEN_STONE_RIVER = '#BDB3A6';
const ZEN_STONE_WARM = '#C7B9A5';
const ZEN_SUNLIGHT = '#FFF7EB';
const ZEN_AMBIENT_SAGE = '#88A78F';

// ─────────────────────────────────────────────────────────────────────────────
// 1. LOW-POLY RIVER STONES (Smooth, Serene Levitation)
// ─────────────────────────────────────────────────────────────────────────────
interface StoneConfig {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  speed: number;
  rotSpeed: [number, number, number];
  phase: number;
}

function FloatingStone({ config }: { config: StoneConfig }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * config.speed;

    // Ultra-slow harmonic floating drift
    meshRef.current.position.y = config.position[1] + Math.sin(t + config.phase) * 0.45;
    meshRef.current.position.x = config.position[0] + Math.cos(t * 0.7 + config.phase) * 0.25;

    // Very subtle axial rotation
    meshRef.current.rotation.x += delta * config.rotSpeed[0];
    meshRef.current.rotation.y += delta * config.rotSpeed[1];
    meshRef.current.rotation.z += delta * config.rotSpeed[2];
  });

  return (
    <mesh ref={meshRef} position={config.position} scale={config.scale}>
      <dodecahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={config.color}
        roughness={0.82}
        metalness={0.04}
        flatShading={true}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ABSTRACT FLOATING LEAVES (Gentle Botanical Drift)
// ─────────────────────────────────────────────────────────────────────────────
interface LeafConfig {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
  swayFreq: number;
  phase: number;
}

function FloatingLeaf({ config }: { config: LeafConfig }) {
  const groupRef = useRef<THREE.Group>(null!);

  // Simple low-poly curved leaf shape
  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.8);
    shape.quadraticCurveTo(0.45, 0, 0, 0.9);
    shape.quadraticCurveTo(-0.45, 0, 0, -0.8);

    const extrudeSettings = {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * config.speed;

    // Gentle floating like a falling leaf suspended in air
    groupRef.current.position.y = config.position[1] + Math.sin(t + config.phase) * 0.35;
    groupRef.current.position.x = config.position[0] + Math.sin(t * 0.8 + config.phase) * 0.3;
    groupRef.current.rotation.z = Math.sin(t * config.swayFreq + config.phase) * 0.25;
    groupRef.current.rotation.y += delta * 0.08;
    groupRef.current.rotation.x = Math.cos(t * 0.6) * 0.15;
  });

  return (
    <group ref={groupRef} position={config.position} scale={config.scale}>
      <mesh geometry={leafGeometry}>
        <meshStandardMaterial
          color={config.color}
          roughness={0.65}
          metalness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GENTLE ZEN SPORES / MORNING LIGHT DUST PARTICLES
// ─────────────────────────────────────────────────────────────────────────────
function ZenPollenParticles({ count = 90 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, speeds, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const phs = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 32;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;

      spd[i] = Math.random() * 0.2 + 0.08;
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

      // Lazy upward drift
      array[idxY] += speeds[i] * delta * 0.5;
      array[idxX] += Math.sin(time * 0.3 + phases[i]) * 0.003;

      if (array[idxY] > 12) {
        array[idxY] = -12;
        array[idxX] = (Math.random() - 0.5) * 32;
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
        color={ZEN_SAGE_MINT}
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE SETUP
// ─────────────────────────────────────────────────────────────────────────────
const STONES: StoneConfig[] = [
  // Upper Left
  {
    position: [-8.5, 4.2, -4],
    scale: [1.2, 0.9, 1.0],
    color: ZEN_STONE_SAND,
    speed: 0.35,
    rotSpeed: [0.03, 0.04, 0.02],
    phase: 0.2,
  },
  // Upper Right Background
  {
    position: [9.2, 5.0, -5],
    scale: [1.4, 1.1, 1.2],
    color: ZEN_STONE_SLATE,
    speed: 0.28,
    rotSpeed: [-0.02, 0.05, 0.01],
    phase: 1.8,
  },
  // Bottom Left
  {
    position: [-9.5, -4.5, -3],
    scale: [1.6, 1.2, 1.4],
    color: ZEN_STONE_RIVER,
    speed: 0.32,
    rotSpeed: [0.04, -0.03, 0.02],
    phase: 3.1,
  },
  // Bottom Right
  {
    position: [8.8, -4.8, -3.5],
    scale: [1.3, 1.0, 1.1],
    color: ZEN_STONE_WARM,
    speed: 0.3,
    rotSpeed: [0.02, 0.03, -0.04],
    phase: 4.5,
  },
  // Deep Center-Far Left
  {
    position: [-13, 0.5, -8],
    scale: [2.1, 1.6, 1.8],
    color: ZEN_STONE_SAND,
    speed: 0.22,
    rotSpeed: [0.01, 0.02, 0.01],
    phase: 2.2,
  },
  // Deep Center-Far Right
  {
    position: [13, 1.0, -8],
    scale: [2.3, 1.7, 1.9],
    color: ZEN_STONE_SLATE,
    speed: 0.24,
    rotSpeed: [-0.02, 0.02, 0.03],
    phase: 5.0,
  },
];

const LEAVES: LeafConfig[] = [
  {
    position: [-5.5, 3.0, -2],
    scale: 0.65,
    color: ZEN_SAGE_DEEP,
    speed: 0.4,
    swayFreq: 1.2,
    phase: 0.8,
  },
  {
    position: [6.2, 2.5, -2.5],
    scale: 0.75,
    color: ZEN_SAGE_LIGHT,
    speed: 0.36,
    swayFreq: 1.0,
    phase: 2.4,
  },
  {
    position: [-4.0, -3.2, -1.8],
    scale: 0.58,
    color: ZEN_SAGE_MINT,
    speed: 0.42,
    swayFreq: 1.4,
    phase: 4.0,
  },
  {
    position: [5.2, -3.0, -2.2],
    scale: 0.7,
    color: ZEN_SAGE_DEEP,
    speed: 0.38,
    swayFreq: 1.1,
    phase: 5.5,
  },
];

function ZenScene() {
  return (
    <>
      {/* Warm Soft Sunlight */}
      <directionalLight position={[8, 14, 7]} intensity={1.35} color={ZEN_SUNLIGHT} />

      {/* Subtle Sage-Green Ambient Light */}
      <ambientLight intensity={0.8} color={ZEN_AMBIENT_SAGE} />

      {/* Soft Secondary Morning Fill Light */}
      <directionalLight position={[-7, -5, 3]} intensity={0.4} color="#D8E4D8" />

      {/* Gentle Warm Point Light */}
      <pointLight position={[0, 4, 3]} intensity={0.45} color="#FDEFD8" distance={25} />

      {/* Low-Poly River Stones */}
      {STONES.map((stone, idx) => (
        <FloatingStone key={`stone-${idx}`} config={stone} />
      ))}

      {/* Abstract Floating Leaves */}
      {LEAVES.map((leaf, idx) => (
        <FloatingLeaf key={`leaf-${idx}`} config={leaf} />
      ))}

      {/* Zen Pollen / Mote Field */}
      <ZenPollenParticles count={80} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MAIN EXPORT: FULL SCREEN FIXED CANVAS
// ─────────────────────────────────────────────────────────────────────────────
export const SpatialZenBackground: React.FC = () => {
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
        background: 'radial-gradient(ellipse at 50% 25%, #FAF7F2 0%, #F4EFE6 55%, #EDE5D8 100%)',
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
        <ZenScene />
      </Canvas>
    </div>
  );
};
