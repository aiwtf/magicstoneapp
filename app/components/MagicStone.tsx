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

    // 2. Extract Data (Unified Schema)
    const density = soul?.density || 0;
    const dims = soul?.dimensions;
    const confidence = soul?.confidence_score ?? 100;
    const isWeak = confidence < 40;

    const rigidness = dims?.cognitive_rigidness ?? 50;
    const entropy = dims?.entropy ?? 0;
    const structure = dims?.structure ?? 50;
    const ethereal = dims?.ethereal ?? 50;

    const color = soul?.soul_color || defaultColor;

    // 3. Visual Logic
    const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

    // Structure determines Polish (Roughness)
    // High Structure (100) -> Very Smooth/Polished (Roughness 0.1)
    // Low Structure (0) -> Rough/Matte (Roughness 0.9)
    const roughness = 0.9 - (structure / 100) * 0.8;

    // Density still boosts "Solidness" (Metalness)
    const metalness = lerp(0.1, 0.8, density);

    // Ethereal determines Transparency (Transmission)
    // High Ethereal -> Glassy/Transparent
    const transmission = lerp(0.2, 1.0, ethereal / 100);

    const entropyFactor = entropy / 100;
    const distortAmount = lerp(0.5, 0.0, structure / 100) + (entropyFactor * 0.3);
    const distortSpeed = lerp(1, 4, entropyFactor);

    // Geometric Detail (Shape Morphology)
    // rigidness 100 -> detail 0 (Icosahedron/Crystal)
    // rigidness 0 -> detail 4 (Sphere/Organic)
    const detail = Math.round(4 * (1 - (rigidness / 100)));

    useFrame((state, delta) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime;

            // Rotation
            const rotationSpeed = 0.2 + (1 - density) * 0.5;
            meshRef.current.rotation.y += delta * rotationSpeed;
            meshRef.current.rotation.x += delta * (rotationSpeed * 0.5);

            // Emissive Pulse (Entropy driven)
            if (meshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
                const pulse = (Math.sin(time * (1 + entropyFactor * 5)) + 1) * 0.5; // 0 to 1
                meshRef.current.material.emissive.set(color);
                meshRef.current.material.emissiveIntensity = 0.1 + (pulse * entropyFactor * 3);
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
                        transparent={true}
                        opacity={isWeak ? 0.4 : 1.0}
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
