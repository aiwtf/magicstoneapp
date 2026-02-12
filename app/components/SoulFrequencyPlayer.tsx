'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, ExternalLink } from 'lucide-react';
import ReactPlayer from 'react-player';

interface SoulFrequencyPlayerProps {
    url: string;
}

export default function SoulFrequencyPlayer({ url }: SoulFrequencyPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(0.8);
    const [isReady, setIsReady] = useState(false);

    // Auto-play attempt handled by 'playing' prop, but browser might block unmuted autoplay.
    // ReactPlayer handles this gracefully usually.

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl mx-auto mt-4 mb-2 z-20"
        >
            <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-black/40 backdrop-blur-md p-4 flex items-center gap-4 group">

                {/* Simulated Generative Visualizer */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center gap-[3px]">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1 bg-gradient-to-t from-red-500 to-purple-600 rounded-full"
                            animate={{
                                height: isPlaying ? [5, Math.random() * 50 + 10, 5] : 4,
                                opacity: isPlaying ? 0.8 : 0.3
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                ease: "linear",
                                delay: i * 0.05
                            }}
                        />
                    ))}
                </div>

                {/* 
                    Hidden Player Wrapper 
                    NOTE: Modern browsers (Chrome) may block media playback if the element is 
                    too small (1x1) or fully hidden (display:none/opacity:0).
                    We keep it technically 'visible' but transparent and behind content.
                */}
                <div className="absolute top-0 left-0 z-[-1] opacity-[0.01] pointer-events-none overflow-hidden">
                    <ReactPlayer
                        url={url}
                        playing={isPlaying}
                        volume={volume}
                        muted={false} // Explicitly ensure sound is on
                        width="100px" // Larger size to satisfy browser heuristics
                        height="100px"
                        onReady={() => {
                            setIsReady(true);
                            // Attempt to force play on ready (sometimes helps with race conditions)
                            setIsPlaying(true);
                        }}
                        onEnded={() => setIsPlaying(false)}
                        onPause={() => setIsPlaying(false)}
                        onPlay={() => setIsPlaying(true)}
                        onError={(e) => console.error("Player Error:", e)}
                        config={{
                            youtube: {
                                playerVars: {
                                    showinfo: 0,
                                    controls: 0,
                                    playsinline: 1,
                                    modestbranding: 1,
                                    origin: typeof window !== 'undefined' ? window.location.origin : undefined
                                } as any
                            }
                        }}
                    />
                </div>

                {/* Spinning Disc / Identifier */}
                <div className="relative z-10 w-12 h-12 flex-shrink-0">
                    <motion.div
                        animate={{ rotate: isPlaying ? 360 : 0 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className={`w-full h-full rounded-full border-2 ${isReady ? 'border-red-500' : 'border-zinc-700'} flex items-center justify-center bg-black`}
                    >
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    </motion.div>
                </div>

                {/* Controls */}
                <div className="flex-1 z-10 min-w-0 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="text-[10px] font-bold text-red-500 tracking-widest uppercase animate-pulse">
                            {isPlaying ? 'SOUL RESONANCE ACTIVE' : 'CONNECTION PAUSED'}
                        </div>
                        <a href={url} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-white transition-colors">
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-white hover:text-black text-white transition-all"
                        >
                            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                        </button>

                        {/* Volume Slider */}
                        <div className="flex items-center gap-2 flex-1 group/vol">
                            <Volume2 className="w-3 h-3 text-zinc-500 group-hover/vol:text-white transition-colors" />
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
