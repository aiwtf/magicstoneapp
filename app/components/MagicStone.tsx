'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float, Stars, Sparkles } from '@react-three/drei';
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

    // 1. Default State (Empty / Void)
    const defaultColor = "#4a4a4a";

    // 2. Extract Soul Data
    // Handle both possible structures if mixed, but prefer SoulComposite
    const density = soul?.density || 0;
    const chaos = soul?.dimensions?.chaos || 0;
    const color = soul?.soul_color || defaultColor;

    // 3. Calculate Visual Parameters based on Density
    // Lerp function helper
    const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

    // Visual Logic:
    // As density goes 0 -> 1:
    // Roughness: 0.8 (Foggy) -> 0.1 (Shiny)
    // Metalness: 0.0 (Plastic) -> 0.7 (Metal)
    // Distortion: High (Unstable) -> Low (Stable) (Also affected by Chaos)

    const roughness = lerp(0.8, 0.1, density);
    const metalness = lerp(0.1, 0.7, density);
    const transmission = lerp(1.0, 0.2, density); // Ghost -> Solid

    // Chaos affects the "Speed" and "Distort" amount
    // If Soul is Chaotic (chaos=100), it keeps moving even when solid.
    // Note: Chaos 0-100 needs scaling
    const chaosFactor = chaos / 100;
    const distortAmount = lerp(0.6, 0.2, density) + (chaosFactor * 0.4);
    const distortSpeed = lerp(2, 0.5, density) + (chaosFactor * 2.0);

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Gentle rotation - faster if low density (unstable)
            const rotationSpeed = 0.2 + (1 - density) * 0.5;
            meshRef.current.rotation.y += delta * rotationSpeed;
            meshRef.current.rotation.x += delta * (rotationSpeed * 0.5);
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
                <Sphere
                    ref={meshRef}
                    args={[1, 64, 64]}
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
                        transmission={transmission} // Glass-like transmission
                        thickness={2} // Refraction thickness
                        distort={distortAmount} // Wobble amount
                        speed={distortSpeed} // Wobble speed
                    />
                </Sphere>
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
