'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, User, Plus, X, Radio } from 'lucide-react';
import { SoulJSON, SoulDimensions, generateSoulHash, calculateResonance } from '../utils/soulEngine';

interface SoulRadarProps {
    userSoul: { dimensions?: SoulDimensions }; // Flexible to accept SoulJSON or SoulComposite
    onClose: () => void;
}

interface GhostSignal {
    id: string;
    hash: string;
    resonance: number; // 0-100
    angle: number; // For visual positioning
    distance: number; // For visual positioning (closer = higher resonance)
    timestamp: number;
}

export default function SoulRadar({ userSoul, onClose }: SoulRadarProps) {
    const [lastScan, setLastScan] = useState<number>(0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setLastScan(Date.now()); }, []);
    const [ghosts, setGhosts] = useState<GhostSignal[]>([]);
    const [scanning, setScanning] = useState(true);

    // Generate User's Hash once
    const userHash = useMemo(() => {
        return generateSoulHash(userSoul.dimensions || {
            structure: 50, luminosity: 50, resonance: 50, ethereal: 50,
            volatility: 50, entropy: 50, cognitive_rigidness: 50, narrative_depth: 50
        });
    }, [userSoul]);

    // Format Hash for display (first 16 chars)
    const displayHash = userHash.substring(0, 16) + '...';

    // Simulation Loop
    useEffect(() => {
        if (!scanning) return;

        const interval = setInterval(() => {
            setLastScan(Date.now());

            // Randomly spawn a ghost (30% chance per tick)
            if (Math.random() > 0.7) {
                // Use userSoul dimensions as a base, or a default if userSoul.dimensions were somehow undefined (though typed as required)
                const baseDims = userSoul.dimensions || {
                    structure: 50, luminosity: 50, resonance: 50, ethereal: 50,
                    volatility: 50, entropy: 50, cognitive_rigidness: 50, narrative_depth: 50
                };

                // Generate ghost dimensions by perturbing the base dimensions
                const randomDims: SoulDimensions = {
                    structure: Math.max(0, Math.min(100, baseDims.structure + (Math.random() - 0.5) * 40)),
                    luminosity: Math.max(0, Math.min(100, baseDims.luminosity + (Math.random() - 0.5) * 40)),
                    resonance: Math.max(0, Math.min(100, baseDims.resonance + (Math.random() - 0.5) * 40)),
                    ethereal: Math.max(0, Math.min(100, baseDims.ethereal + (Math.random() - 0.5) * 40)),
                    volatility: Math.max(0, Math.min(100, baseDims.volatility + (Math.random() - 0.5) * 40)),
                    entropy: Math.max(0, Math.min(100, baseDims.entropy + (Math.random() - 0.5) * 40)),
                    cognitive_rigidness: Math.max(0, Math.min(100, baseDims.cognitive_rigidness + (Math.random() - 0.5) * 40)),
                    narrative_depth: Math.max(0, Math.min(100, baseDims.narrative_depth + (Math.random() - 0.5) * 40))
                };
                const ghostHash = generateSoulHash(randomDims);
                const resonance = calculateResonance(userHash, ghostHash);

                // Keep only recent ghosts
                const newGhost: GhostSignal = {
                    id: Math.random().toString(36).substr(2, 9),
                    hash: ghostHash,
                    resonance,
                    angle: Math.random() * 360,
                    distance: Math.max(0.2, 1 - (resonance / 100)), // High resonance = close to center
                    timestamp: Date.now()
                };

                setGhosts(prev => [...prev.slice(-19), newGhost]); // Keep last 20
            }

            // Cleanup old ghosts
            setGhosts(prev => prev.filter(g => Date.now() - g.timestamp < 10000));

        }, 2000); // Pulse every 2s

        return () => clearInterval(interval);
    }, [scanning, userHash]);

    return (
        <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center text-white overflow-hidden">

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors z-50"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="absolute top-10 text-center z-50">
                <h2 className="text-2xl font-bold tracking-[0.2em] text-cyan-400 uppercase flex items-center gap-2 justify-center">
                    <Radio className="w-5 h-5 animate-pulse" />
                    Soul Radar
                </h2>
                <p className="text-[10px] text-zinc-500 mt-2 font-mono">
                    ID: {displayHash}
                </p>
                <div className="flex items-center justify-center gap-4 mt-2">
                    <span className="text-[10px] text-zinc-600">SCANNING ETHEREAL PLANE...</span>
                </div>
            </div>

            {/* Radar Visual */}
            <div className="relative w-[350px] h-[350px] flex items-center justify-center">
                {/* Rings */}
                <div className="absolute inset-0 border border-cyan-900/30 rounded-full" />
                <div className="absolute inset-8 border border-cyan-900/30 rounded-full" />
                <div className="absolute inset-16 border border-cyan-900/30 rounded-full" />
                <div className="absolute inset-24 border border-cyan-900/30 rounded-full" />

                {/* Scan Line */}
                <motion.div
                    className="absolute w-full h-[50%] bg-gradient-to-t from-cyan-500/20 to-transparent top-[50%] origin-top left-0 right-0 pointer-events-none"
                    style={{ borderTop: '1px solid rgba(6,182,212,0.5)' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                {/* User Center */}
                <div className="absolute w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.8)] z-20" />

                {/* Ghosts */}
                <AnimatePresence>
                    {ghosts.map(ghost => {
                        // Convert polar to cartesian for plotting relative to center (175px radius)
                        const radius = ghost.distance * 150; // Max 150px out
                        const rad = ghost.angle * (Math.PI / 180);
                        const x = Math.cos(rad) * radius;
                        const y = Math.sin(rad) * radius;

                        // Color based on Resonance
                        const isMatch = ghost.resonance > 80;
                        const color = isMatch ? 'bg-yellow-400' : (ghost.resonance > 60 ? 'bg-blue-400' : 'bg-zinc-600');
                        const shadow = isMatch ? 'shadow-[0_0_15px_rgba(250,204,21,0.8)]' : '';

                        return (
                            <motion.div
                                key={ghost.id}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className={`absolute w-3 h-3 rounded-full ${color} ${shadow} z-10 cursor-pointer group`}
                                style={{ x, y }}
                            >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-black/80 border border-zinc-800 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    Resonance: {ghost.resonance}%
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Legend / Status */}
            <div className="absolute bottom-10 w-full max-w-sm px-6">
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mb-2">
                    <span>RANGE: GLOBAL</span>
                    <span>PROTOCOL: LSH-128</span>
                </div>
                <div className="h-0.5 w-full bg-zinc-800 overflow-hidden relative">
                    <motion.div
                        className="absolute h-full bg-cyan-500/50 w-10"
                        animate={{ x: [-40, 400] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </div>

        </div>
    );
}
