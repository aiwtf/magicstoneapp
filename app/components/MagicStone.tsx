'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Icosahedron, Float, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { SoulComposite } from '../utils/soulAggregator';

// We allow receiving either SoulComposite (preferred) or SoulJSON structure (legacy/compatible)
// But for Phase 4 we mostly rely on the composite structure which has density.
interface MagicStoneProps {
    soul: SoulComposite | null;
    onClick?: () => void;
}

export default function MagicStone({ soul, onClick }: MagicStoneProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    // 1. Default State
    const defaultColor = "#4a4a4a";

    // 2. Extract Data
    const density = soul?.density || 0;
    const chaos = soul?.dimensions?.chaos || 0;
    // Use rigidness to control geometry detail: 0 (Organic/Sphere) <-> 100 (Geometric/Crystal)
    // Actually, Icosahedron detail=0 is Crystal (20 faces). Detail=5 is Sphere.
    // So High Rigidness (100) -> Detail 0. Low Rigidness (0) -> Detail 4.
    const rigidness = soul?.dimensions?.cognitive_rigidness ?? 50;
    const color = soul?.soul_color || defaultColor;

    // 3. Visual Logic
    const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

    const roughness = lerp(0.8, 0.1, density);
    const metalness = lerp(0.1, 0.7, density);
    const transmission = lerp(1.0, 0.2, density);

    const chaosFactor = chaos / 100;
    const distortAmount = lerp(0.6, 0.1, density) + (chaosFactor * 0.4);
    const distortSpeed = lerp(2, 0.5, density) + (chaosFactor * 2.0);

    // Geometric Detail (Shape Morphology)
    // rigidness 100 -> detail 0
    // rigidness 0 -> detail 4
    const detail = Math.round(4 * (1 - (rigidness / 100)));

    useFrame((state, delta) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime;

            // Rotation
            const rotationSpeed = 0.2 + (1 - density) * 0.5;
            meshRef.current.rotation.y += delta * rotationSpeed;
            meshRef.current.rotation.x += delta * (rotationSpeed * 0.5);

            // Emissive Pulse (Entropy/Chaos driven)
            // Pulse intensity proportional to chaos
            // Base emissive 0, Pulse up to chaosFactor
            // Frequency also driven by chaos
            if (meshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
                const pulse = (Math.sin(time * (1 + chaosFactor * 5)) + 1) * 0.5; // 0 to 1
                meshRef.current.material.emissive.set(color);
                meshRef.current.material.emissiveIntensity = 0.1 + (pulse * chaosFactor * 2);
            }
        }
    });

    return (
        <group>
            {/* Background Ambience */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {/* Floating Animation wrapper */}
            <Float
                speed={2} // Animation speed
                rotationIntensity={1} // XYZ rotation intensity
                floatIntensity={2} // Up/down float intensity
            >
                <Icosahedron
                    ref={meshRef}
                    args={[1, detail]} // Dynamic Geometry
                    scale={1.5}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onClick) onClick();
                    }}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                    {/* The Soul Material */}
                    <MeshDistortMaterial
                        color={color}
                        envMapIntensity={1}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                        metalness={metalness}
                        roughness={roughness}
                        transmission={transmission}
                        thickness={2}
                        distort={distortAmount}
                        speed={distortSpeed}
                    />
                </Icosahedron>
            </Float>

            {/* Particle Effects (Only appear when density > 0) */}
            {density > 0 && (
                <Sparkles
                    count={50 * (density * 10)}
                    scale={4}
                    size={2}
                    speed={0.4}
                    opacity={0.5}
                    color={color}
                />
            )}
        </group>
    );
}
