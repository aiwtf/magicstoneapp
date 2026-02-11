'use client';

/**
 * SoulMarker.tsx - CSS-based glowing orb marker for Mapbox.
 *
 * Renders a pulsing, glowing orb using pure CSS animations.
 * Used as the content of Mapbox <Marker> components.
 */

import { motion } from 'framer-motion';

interface SoulMarkerProps {
    color: string;
    label?: string;
    isUser?: boolean;
    size?: number;
    onClick?: () => void;
}

export default function SoulMarker({
    color,
    label,
    isUser = false,
    size = 24,
    onClick,
}: SoulMarkerProps) {
    const outerSize = isUser ? size * 3 : size * 2.5;
    const pulseSize = isUser ? size * 4 : size * 3;

    return (
        <div
            className="relative flex items-center justify-center cursor-pointer group"
            style={{ width: pulseSize, height: pulseSize }}
            onClick={onClick}
        >
            {/* Outer pulse ring */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: outerSize,
                    height: outerSize,
                    border: `1px solid ${color}`,
                    opacity: 0.3,
                }}
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0, 0.3],
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Secondary pulse ring (user only) */}
            {isUser && (
                <motion.div
                    className="absolute rounded-full"
                    style={{
                        width: outerSize * 0.8,
                        height: outerSize * 0.8,
                        border: `1px solid ${color}`,
                        opacity: 0.2,
                    }}
                    animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.2, 0, 0.2],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.5,
                    }}
                />
            )}

            {/* Glow halo */}
            <div
                className="absolute rounded-full"
                style={{
                    width: size * 1.8,
                    height: size * 1.8,
                    background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
                }}
            />

            {/* Core orb */}
            <motion.div
                className="relative rounded-full"
                style={{
                    width: size,
                    height: size,
                    background: `radial-gradient(circle at 35% 35%, ${color}ee, ${color}88, ${color}44)`,
                    boxShadow: `0 0 ${size * 0.6}px ${color}88, 0 0 ${size * 1.2}px ${color}44, inset 0 0 ${size * 0.3}px ${color}cc`,
                }}
                animate={{
                    boxShadow: [
                        `0 0 ${size * 0.6}px ${color}88, 0 0 ${size * 1.2}px ${color}44, inset 0 0 ${size * 0.3}px ${color}cc`,
                        `0 0 ${size * 1}px ${color}aa, 0 0 ${size * 2}px ${color}66, inset 0 0 ${size * 0.5}px ${color}ee`,
                        `0 0 ${size * 0.6}px ${color}88, 0 0 ${size * 1.2}px ${color}44, inset 0 0 ${size * 0.3}px ${color}cc`,
                    ],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                {/* Inner bright core */}
                <div
                    className="absolute top-[25%] left-[25%] rounded-full"
                    style={{
                        width: size * 0.3,
                        height: size * 0.3,
                        background: `radial-gradient(circle, white, ${color})`,
                        opacity: 0.8,
                        filter: `blur(${size * 0.05}px)`,
                    }}
                />
            </motion.div>

            {/* Label (on hover or always for user) */}
            {label && (
                <div
                    className={`absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] tracking-wider uppercase ${isUser ? 'text-white/70' : 'text-white/0 group-hover:text-white/60'
                        } transition-colors duration-300`}
                    style={{ textShadow: `0 0 8px ${color}` }}
                >
                    {label}
                </div>
            )}
        </div>
    );
}
