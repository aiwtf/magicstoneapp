'use client';

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { SoulJSON } from "../utils/soulEngine";

export default function MagicStone({ isAbsorbing = false, progress = 0, soulData }: { isAbsorbing?: boolean, progress?: number, soulData?: SoulJSON }) {
    const [isHovered, setIsHovered] = useState(false);

    // Default values
    const defaultColor = "#8B5CF6"; // magic-purple
    const color = soulData?.soul_color || defaultColor;

    // Dimensions (0-100) or defaults
    const chaos = soulData?.dimensions?.chaos || 20;
    const logic = soulData?.dimensions?.logic || 50;
    const mysticism = soulData?.dimensions?.mysticism || 50;

    // Derived Visual Parameters

    // 1. Shape Roughness (Chaos): Low Chaos = Circle (50%), High Chaos = Irregular
    const borderRadius = useMemo(() => {
        if (!soulData) return "50%";
        // Create 8 points of variance based on chaos
        const variance = () => 50 + (Math.random() * chaos - (chaos / 2));
        return `${variance()}% ${variance()}% ${variance()}% ${variance()}% / ${variance()}% ${variance()}% ${variance()}% ${variance()}%`;
    }, [soulData, chaos]);

    // 2. Pulse Speed (Logic): High Logic = Slow/Steady (4s), Low Logic = Fast/Erratic (0.5s)
    // Invert logic for duration: 100 logic -> 4s, 0 logic -> 0.5s
    const pulseDuration = useMemo(() => {
        if (!soulData) return 3;
        return 0.5 + (logic / 100) * 3.5;
    }, [logic]);

    // 3. Glow Intensity (Mysticism): High Mysticism = Larger blur radius
    const glowBlur = useMemo(() => {
        return 20 + (mysticism / 100) * 60; // 20px to 80px
    }, [mysticism]);


    // Calculate dynamic scale based on progress (0-100)
    const growthScale = 1 + (progress / 200);

    return (
        <div className="relative flex flex-col items-center justify-center p-10 cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Outer Glow - Dynamic Color & Blur */}
            <motion.div
                className="absolute w-64 h-64 rounded-full opacity-20 transition-all duration-1000"
                style={{
                    backgroundColor: color,
                    filter: `blur(${glowBlur}px)`,
                    opacity: 0.2 + (progress / 500)
                }}
                animate={{
                    scale: isAbsorbing ? [1, 2, 1] : [1, 1.2, 1],
                }}
                transition={{
                    duration: isAbsorbing ? 0.5 : pulseDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "mirror"
                }}
            />

            {/* Cyan/Secondary Inner Glow - Complementary or default */}
            <motion.div
                className="absolute w-48 h-48 rounded-full blur-[40px] opacity-20 bg-magic-cyan/50 group-hover:opacity-50 transition-opacity duration-1000"
                animate={{
                    scale: isAbsorbing ? [1.1, 1.5, 1.1] : [1.1, 1, 1.1],
                }}
                transition={{
                    duration: isAbsorbing ? 0.5 : pulseDuration * 0.8, // Slightly offset rhythm
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* The Stone Itself */}
            <motion.div
                className="relative z-10 w-48 h-48 bg-gradient-to-br from-gray-800 via-black to-gray-900 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] border border-white/10"
                style={{
                    borderRadius: borderRadius, // DYNAMIC SHAPE
                    boxShadow: `0 0 ${chaos / 2}px ${color}40`, // Chaos adds a jittery outer rim
                }}
                animate={{
                    y: isAbsorbing ? [0, -20, 0] : [0, -10, 0],
                    rotate: isAbsorbing ? [0, 180, 360] : [0, 5, -5, 0],
                    scale: isAbsorbing ? [growthScale, growthScale * 1.1, growthScale] : growthScale,
                }}
                whileHover={{
                    scale: growthScale * 1.05,
                    rotate: 0,
                }}
                transition={{
                    y: { duration: isAbsorbing ? 0.5 : 6, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: isAbsorbing ? 1 : 20, repeat: Infinity, ease: isAbsorbing ? "easeInOut" : "linear" },
                    scale: { duration: 0.5 },
                }}
            >
                {/* Stone Texture / internal reflection */}
                <div
                    className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_60%)]"
                    style={{ borderRadius: borderRadius }}
                ></div>

                {/* Pulsing Core - Driven by Soul Color */}
                <motion.div
                    className="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
                    style={{ backgroundColor: color }}
                    animate={{
                        opacity: isAbsorbing ? [0.2, 1, 0.2] : [0.2 + (progress / 200), 0.8 + (progress / 200), 0.2 + (progress / 200)],
                        scale: isAbsorbing ? [1, 3, 1] : [1, 1.5, 1]
                    }}
                    transition={{ duration: isAbsorbing ? 0.5 : pulseDuration, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>

            {/* Text hint */}
            <motion.p
                className="mt-12 text-gray-400 text-sm tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 group-hover:text-magic-cyan transition-all duration-500"
                animate={{ opacity: isAbsorbing ? 0 : [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
            >
                {isAbsorbing ? "ABSORBING..." : (soulData ? soulData.archetype : "Touch the Stone")}
            </motion.p>
        </div>
    );
}
