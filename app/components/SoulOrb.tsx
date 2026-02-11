'use client';

/**
 * SoulOrb.tsx - A 3D glass orb representing a soul in the Drifting World.
 *
 * Uses MeshPhysicalMaterial with transmission (glass) and emission (glow).
 * Each orb has a unique color based on archetype and pulses gently.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface SoulOrbProps {
    position: [number, number, number];
    color: string;
    soulId: string;
    label?: string;
    scale?: number;
    isUser?: boolean;
    onClick?: () => void;
}

export default function SoulOrb({
    position,
    color,
    soulId,
    label,
    scale = 1,
    isUser = false,
    onClick,
}: SoulOrbProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);

    // Stable random offset per orb (for desynchronized animation)
    const randomOffset = useMemo(() => {
        let hash = 0;
        for (let i = 0; i < soulId.length; i++) {
            hash = ((hash << 5) - hash + soulId.charCodeAt(i)) | 0;
        }
        return (hash % 1000) / 1000;
    }, [soulId]);

    const orbColor = useMemo(() => new THREE.Color(color), [color]);

    useFrame((state) => {
        const time = state.clock.elapsedTime + randomOffset * 10;

        if (meshRef.current) {
            // Gentle rotation
            meshRef.current.rotation.y = time * 0.3;
            meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;

            // Emissive pulse
            const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
            if (mat) {
                const pulse = (Math.sin(time * 1.5) + 1) * 0.5;
                mat.emissiveIntensity = isUser ? 0.3 + pulse * 0.5 : 0.1 + pulse * 0.3;
            }
        }

        // Outer glow sphere pulse
        if (glowRef.current) {
            const glowPulse = (Math.sin(time * 1.2) + 1) * 0.5;
            glowRef.current.scale.setScalar(1.3 + glowPulse * 0.15);
            const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;
            if (glowMat) {
                glowMat.opacity = 0.04 + glowPulse * 0.06;
            }
        }

        // Identity ring rotation (user orb only)
        if (ringRef.current) {
            ringRef.current.rotation.z = time * 0.5;
            ringRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 0.3) * 0.1;
        }
    });

    return (
        <group position={position}>
            <Float
                speed={1.5 + randomOffset}
                rotationIntensity={0.3}
                floatIntensity={isUser ? 0.8 : 1.2}
            >
                {/* Outer glow sphere */}
                <mesh ref={glowRef} scale={1.3}>
                    <sphereGeometry args={[scale, 32, 32]} />
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={0.06}
                        side={THREE.BackSide}
                    />
                </mesh>

                {/* Main glass orb */}
                <mesh
                    ref={meshRef}
                    scale={scale}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick?.();
                    }}
                    onPointerOver={() => (document.body.style.cursor = 'pointer')}
                    onPointerOut={() => (document.body.style.cursor = 'auto')}
                >
                    <sphereGeometry args={[1, 64, 64]} />
                    <meshPhysicalMaterial
                        color={color}
                        emissive={orbColor}
                        emissiveIntensity={0.2}
                        transmission={0.6}
                        thickness={1.5}
                        roughness={0.05}
                        metalness={0.1}
                        clearcoat={1}
                        clearcoatRoughness={0}
                        ior={1.5}
                        envMapIntensity={1}
                        transparent
                        opacity={0.9}
                    />
                </mesh>

                {/* Identity ring (user orb only) */}
                {isUser && (
                    <mesh ref={ringRef} scale={scale * 1.6}>
                        <torusGeometry args={[1, 0.015, 16, 100]} />
                        <meshBasicMaterial
                            color={color}
                            transparent
                            opacity={0.4}
                        />
                    </mesh>
                )}

                {/* Tiny inner core (bright point) */}
                <mesh scale={scale * 0.15}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshBasicMaterial color={color} />
                </mesh>
            </Float>
        </group>
    );
}
