import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// TOKYO NIGHT COLOR CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const TN_NAVY_VOID = '#10121a';
const TN_CYAN = '#7dcfff';
const TN_PURPLE = '#bb9af7';
const TN_BLUE = '#2ac3de';
const TN_MAGENTA = '#c0caf5';

// ─────────────────────────────────────────────────────────────────────────────
// 1. ANTI-GRAVITY PARTICLE FIELD (Drifting upward with subtle sine wave sway)
// ─────────────────────────────────────────────────────────────────────────────
interface ParticleData {
  positions: Float32Array;
  speeds: Float32Array;
  phases: Float32Array;
  count: number;
}

function AntiGravityParticles({ count = 380 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, speeds, phases } = useMemo<ParticleData>(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const phs = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Wide dispersion volume across camera field of view
      pos[i * 3 + 0] = (Math.random() - 0.5) * 40;     // X: -20 to +20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 32;     // Y: -16 to +16
      pos[i * 3 + 2] = (Math.random() - 0.5) * 24 - 4; // Z: -16 to +8

      // Slow upward anti-gravity velocity
      spd[i] = Math.random() * 0.45 + 0.15;
      phs[i] = Math.random() * Math.PI * 2;
    }

    return { positions: pos, speeds: spd, phases: phs, count };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;
    const time = state.clock.elapsedTime;

    // Upward anti-gravity drift loop
    for (let i = 0; i < count; i++) {
      const idxY = i * 3 + 1;
      const idxX = i * 3 + 0;

      // Move upward
      array[idxY] += speeds[i] * delta * 0.6;

      // Subtle horizontal float
      array[idxX] += Math.sin(time * 0.5 + phases[i]) * 0.003;

      // Wrap around top boundary back to bottom
      if (array[idxY] > 16) {
        array[idxY] = -16;
        array[idxX] = (Math.random() - 0.5) * 40;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.11}
        color={TN_CYAN}
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. FLOATING WIREFRAME POLYHEDRON
// ─────────────────────────────────────────────────────────────────────────────
interface PolyhedronProps {
  type: 'icosahedron' | 'tetrahedron' | 'octahedron' | 'dodecahedron';
  position: [number, number, number];
  size: number;
  color: string;
  rotSpeed?: { x: number; y: number; z: number };
  floatAmp?: number;
  floatSpeed?: number;
  floatOffset?: number;
}

function FloatingPolyhedron({
  type,
  position,
  size,
  color,
  rotSpeed = { x: 0.04, y: 0.06, z: 0.02 },
  floatAmp = 0.45,
  floatSpeed = 0.6,
  floatOffset = 0,
}: PolyhedronProps) {
  const meshRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    // Slow, serene rotation on multiple axes
    meshRef.current.rotation.x += delta * rotSpeed.x;
    meshRef.current.rotation.y += delta * rotSpeed.y;
    meshRef.current.rotation.z += delta * rotSpeed.z;

    // Smooth sinusoidal anti-gravity levitation
    const time = state.clock.elapsedTime;
    meshRef.current.position.y =
      position[1] + Math.sin(time * floatSpeed + floatOffset) * floatAmp;
  });

  const renderGeometry = () => {
    switch (type) {
      case 'icosahedron':
        return <icosahedronGeometry args={[size, 0]} />;
      case 'tetrahedron':
        return <tetrahedronGeometry args={[size, 0]} />;
      case 'octahedron':
        return <octahedronGeometry args={[size, 0]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[size, 0]} />;
    }
  };

  return (
    <group ref={meshRef} position={position}>
      {/* Outer Glowing Wireframe */}
      <mesh>
        {renderGeometry()}
        <meshStandardMaterial
          wireframe
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Inner Translucent Dark Core for Depth */}
      <mesh scale={0.96}>
        {renderGeometry()}
        <meshStandardMaterial
          color="#16161e"
          roughness={0.5}
          metalness={0.2}
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. INTERACTIVE CAMERA RIG (Subtle gentle mouse parallax without blocking UI)
// ─────────────────────────────────────────────────────────────────────────────
function InteractiveCameraRig() {
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse between -1 and 1
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    // Very gentle lerp toward target mouse offset for subtle parallax
    const targetX = mouseRef.current.x * 0.9;
    const targetY = mouseRef.current.y * 0.6;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, delta * 1.2);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, delta * 1.2);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MAIN TOKYO 3D BACKGROUND COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const Tokyo3DBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      {/* Deep Navy Radial Fallback Void Layer */}
      <div className="absolute inset-0 bg-[#0c0e17] bg-radial-[at_center_top] from-[#1a1b26] via-[#10121a] to-[#0a0b12] -z-10" />

      {/* Subtle Tokyo Night ambient glow flares behind frosted glass */}
      <div className="absolute top-[-10%] left-[15%] w-[650px] h-[650px] bg-[#7dcfff]/6 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[15%] w-[650px] h-[650px] bg-[#bb9af7]/6 rounded-full blur-[180px] pointer-events-none" />

      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 0, 14], fov: 60, near: 0.1, far: 80 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      >
        {/* Tokyo Night Atmospheric Fog */}
        <fog attach="fog" args={[TN_NAVY_VOID, 12, 36]} />

        {/* Ambient Void Lighting */}
        <ambientLight intensity={0.5} color="#1f2335" />

        {/* Soft Neon Cyan Point Light (Top-Left Accent) */}
        <pointLight
          position={[-9, 6, 5]}
          intensity={35}
          distance={32}
          color={TN_CYAN}
          decay={2}
        />

        {/* Soft Neon Purple Point Light (Bottom-Right Accent) */}
        <pointLight
          position={[9, -6, 4]}
          intensity={35}
          distance={32}
          color={TN_PURPLE}
          decay={2}
        />

        {/* Soft Blue Center Backlight */}
        <pointLight
          position={[0, 1, -2]}
          intensity={16}
          distance={25}
          color={TN_BLUE}
          decay={2}
        />

        {/* Interactive Smooth Camera Rig */}
        <InteractiveCameraRig />

        {/* Anti-Gravity Upward Particle Field */}
        <AntiGravityParticles count={360} />

        {/* Gentle Drei Star Dust Shimmer */}
        <Sparkles
          count={75}
          scale={26}
          size={2.2}
          speed={0.25}
          opacity={0.4}
          color={TN_PURPLE}
        />
        <Sparkles
          count={45}
          scale={22}
          size={1.8}
          speed={0.2}
          opacity={0.35}
          color={TN_CYAN}
        />

        {/* ── Floating Geometric Polyhedron Wireframes ── */}
        {/* 1. Top-Left Icosahedron (Neon Cyan) */}
        <FloatingPolyhedron
          type="icosahedron"
          position={[-7.2, 3.8, -4]}
          size={2.1}
          color={TN_CYAN}
          rotSpeed={{ x: 0.05, y: 0.07, z: 0.03 }}
          floatAmp={0.5}
          floatSpeed={0.55}
          floatOffset={0}
        />

        {/* 2. Bottom-Right Tetrahedron (Neon Purple) */}
        <FloatingPolyhedron
          type="tetrahedron"
          position={[7.6, -3.2, -4.5]}
          size={1.9}
          color={TN_PURPLE}
          rotSpeed={{ x: -0.06, y: 0.08, z: 0.04 }}
          floatAmp={0.45}
          floatSpeed={0.65}
          floatOffset={2.1}
        />

        {/* 3. Bottom-Left Octahedron (Neon Blue) */}
        <FloatingPolyhedron
          type="octahedron"
          position={[-8.4, -4.2, -6]}
          size={1.6}
          color={TN_BLUE}
          rotSpeed={{ x: 0.04, y: -0.06, z: 0.05 }}
          floatAmp={0.4}
          floatSpeed={0.5}
          floatOffset={4.2}
        />

        {/* 4. Top-Right Dodecahedron (Soft Lavender / Pink) */}
        <FloatingPolyhedron
          type="dodecahedron"
          position={[6.8, 4.6, -6.5]}
          size={1.7}
          color={TN_MAGENTA}
          rotSpeed={{ x: -0.04, y: 0.05, z: -0.03 }}
          floatAmp={0.42}
          floatSpeed={0.48}
          floatOffset={1.3}
        />

        {/* 5. Deep Center Icosahedron (Subtle distant focal anchor) */}
        <FloatingPolyhedron
          type="icosahedron"
          position={[0.2, -6.5, -9]}
          size={1.3}
          color={TN_CYAN}
          rotSpeed={{ x: 0.03, y: 0.04, z: 0.02 }}
          floatAmp={0.3}
          floatSpeed={0.4}
          floatOffset={3.5}
        />
      </Canvas>
    </div>
  );
};
