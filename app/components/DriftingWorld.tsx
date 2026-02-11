'use client';

/**
 * DriftingWorld.tsx - The Phase 5 3D Drifting World
 *
 * A fullscreen immersive 3D scene where Soul Orbs float in a dark,
 * foggy ether. The user's orb is centered with ghost orbs nearby.
 */

import { Suspense, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import {
    PerspectiveCamera,
    OrbitControls,
    Stars,
    Sparkles,
    Environment,
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Compass } from 'lucide-react';
import * as THREE from 'three';
import SoulOrb from './SoulOrb';
import { SoulComposite } from '../utils/soulAggregator';

// Archetype-based color palette for ghost orbs
const GHOST_COLORS = [
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#10B981', // Emerald
    '#EC4899', // Pink
    '#3B82F6', // Blue
    '#F97316', // Orange
];

const GHOST_ARCHETYPES = [
    'The Dreamer',
    'The Architect',
    'The Wanderer',
    'The Alchemist',
    'The Guardian',
    'The Oracle',
    'The Rebel',
    'The Healer',
];

interface GhostSoul {
    id: string;
    position: [number, number, number];
    color: string;
    archetype: string;
}

/**
 * Generate mock ghost souls distributed in a spherical shell around origin.
 */
function generateGhostSouls(count: number): GhostSoul[] {
    const ghosts: GhostSoul[] = [];
    for (let i = 0; i < count; i++) {
        // Distribute in a spherical shell (radius 4-10)
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 4 + Math.random() * 6;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = (Math.random() - 0.5) * 4; // Slight vertical spread
        const z = r * Math.sin(phi) * Math.sin(theta);

        ghosts.push({
            id: `ghost-${i}-${Date.now()}`,
            position: [x, y, z],
            color: GHOST_COLORS[i % GHOST_COLORS.length],
            archetype: GHOST_ARCHETYPES[i % GHOST_ARCHETYPES.length],
        });
    }
    return ghosts;
}

/** The 3D scene content (rendered inside Canvas) */
function DriftingScene({
    userColor,
    ghostSouls,
}: {
    userColor: string;
    ghostSouls: GhostSoul[];
}) {
    return (
        <>
            {/* Camera */}
            <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={60} />

            {/* Controls */}
            <OrbitControls
                autoRotate
                autoRotateSpeed={0.3}
                enableZoom={true}
                enablePan={false}
                minDistance={3}
                maxDistance={20}
                maxPolarAngle={Math.PI * 0.85}
            />

            {/* Lighting */}
            <ambientLight intensity={0.15} />
            <pointLight position={[0, 0, 0]} intensity={0.5} color={userColor} distance={15} />
            <pointLight position={[10, 5, -10]} intensity={0.3} color="#8B5CF6" />
            <pointLight position={[-10, -5, 10]} intensity={0.2} color="#06B6D4" />

            {/* Fog */}
            <fog attach="fog" args={['#000000', 8, 30]} />

            {/* Background Stars */}
            <Stars
                radius={60}
                depth={50}
                count={3000}
                factor={3}
                saturation={0.1}
                fade
                speed={0.5}
            />

            {/* Ambient Particles */}
            <Sparkles
                count={100}
                scale={20}
                size={1.5}
                speed={0.2}
                opacity={0.3}
                color="#8B5CF6"
            />

            {/* === User's Soul Orb (Center) === */}
            <SoulOrb
                position={[0, 0, 0]}
                color={userColor}
                soulId="user-soul"
                isUser={true}
                scale={1.2}
            />

            {/* === Ghost Orbs === */}
            {ghostSouls.map((ghost) => (
                <SoulOrb
                    key={ghost.id}
                    position={ghost.position}
                    color={ghost.color}
                    soulId={ghost.id}
                    label={ghost.archetype}
                    scale={0.4 + Math.random() * 0.3}
                />
            ))}

            {/* Grid plane (subtle reference) */}
            <gridHelper
                args={[40, 40, '#1a1a2e', '#1a1a2e']}
                position={[0, -3, 0]}
            />
        </>
    );
}

/** Loading fallback for 3D scene */
function LoadingOverlay() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 rounded-full border border-purple-500/30 flex items-center justify-center"
            >
                <Compass className="w-8 h-8 text-purple-400" />
            </motion.div>
            <p className="mt-4 text-xs text-zinc-500 uppercase tracking-widest">
                Entering the Ether...
            </p>
        </div>
    );
}

interface DriftingWorldProps {
    isOpen: boolean;
    onClose: () => void;
    soulData?: SoulComposite | null;
}

export default function DriftingWorld({ isOpen, onClose, soulData }: DriftingWorldProps) {
    const userColor = soulData?.soul_color || '#8B5CF6';
    const archetypeName = soulData?.archetype_name || 'Unknown';

    // Generate ghost souls (memoized so they don't regenerate on re-render)
    const ghostSouls = useMemo(() => generateGhostSouls(8), []);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black"
            >
                {/* HUD Overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="pointer-events-auto absolute top-6 right-6 p-2 rounded-full border border-white/10 bg-black/50 backdrop-blur-sm text-zinc-400 hover:text-white hover:border-white/30 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* User Identity Badge */}
                    <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: userColor, boxShadow: `0 0 8px ${userColor}` }}
                            />
                            <span className="text-[11px] text-zinc-300 font-medium tracking-wide">
                                {archetypeName}
                            </span>
                        </div>
                        <span className="text-[9px] text-zinc-700 uppercase tracking-widest">
                            The Drifting World
                        </span>
                    </div>

                    {/* Ghost count indicator */}
                    <div className="pointer-events-none absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-zinc-500 tracking-wider">
                            {ghostSouls.length} souls nearby
                        </span>
                    </div>
                </div>

                {/* 3D Canvas */}
                <Suspense fallback={<LoadingOverlay />}>
                    <Canvas
                        gl={{
                            antialias: true,
                            toneMapping: THREE.ACESFilmicToneMapping,
                            toneMappingExposure: 0.8,
                        }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <DriftingScene userColor={userColor} ghostSouls={ghostSouls} />
                    </Canvas>
                </Suspense>
            </motion.div>
        </AnimatePresence>
    );
}
