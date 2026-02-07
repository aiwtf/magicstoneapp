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

    // Visual Overhaul: Density drives the Ore -> Gem transition
    // Low Density < 0.6 = Raw Ore (Rough, Dark)
    // High Density > 0.8 = Polished Gem (Shiny, Smooth)

    const roughness = lerp(1.0, 0.1, density); // 1.0 = Very Rough (Coal)
    const metalness = lerp(0.0, 0.9, density); // 0.0 = Matte (Coal)

    // Always Solid
    const transmission = 0;

    const entropyFactor = entropy / 100;
    // Reduced distortion: Rock (0.1) -> Crystal (0.0)
    // "Gas"/"Cloud" look usually comes from high distortion + transparency
    const distortAmount = lerp(0.1, 0.0, density) + (entropyFactor * 0.05);
    const distortSpeed = lerp(0.5, 2, entropyFactor); // Slower movement for rock

    // Geometric Detail (Shape Morphology)
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
                    scale={1.15}
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
                        clearcoat={density > 0.6 ? 1 : 0}
                        clearcoatRoughness={0.1}
                        metalness={metalness}
                        roughness={roughness}
                        transmission={transmission}
                        thickness={2}
                        distort={distortAmount}
                        speed={distortSpeed}
                        transparent={false}
                        opacity={1}
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
