'use client';

import { motion } from "framer-motion";
import { useState } from "react";

export default function MagicStone() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="relative flex flex-col items-center justify-center p-10 cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Outer Glow */}
            <motion.div
                className="absolute w-64 h-64 rounded-full blur-[60px] opacity-20 bg-magic-purple group-hover:opacity-40 transition-opacity duration-1000"
                animate={{
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Cyan Inner Glow */}
            <motion.div
                className="absolute w-48 h-48 rounded-full blur-[40px] opacity-20 bg-magic-cyan/50 group-hover:opacity-50 transition-opacity duration-1000"
                animate={{
                    scale: [1.1, 1, 1.1],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* The Stone Itself */}
            <motion.div
                className="relative z-10 w-48 h-48 rounded-[40%] bg-gradient-to-br from-gray-800 via-black to-gray-900 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] border border-white/10"
                animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                }}
                whileHover={{
                    scale: 1.05,
                    rotate: 0,
                }}
                transition={{
                    y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 0.5 },
                }}
            >
                {/* Stone Texture / internal reflection */}
                <div className="absolute inset-0 rounded-[40%] opacity-50 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_60%)]"></div>

                {/* Pulsing Core */}
                <motion.div
                    className="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-magic-purple blur-md"
                    animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>

            {/* Text hint */}
            <motion.p
                className="mt-12 text-gray-400 text-sm tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 group-hover:text-magic-cyan transition-all duration-500"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
            >
                Touch the Stone
            </motion.p>
        </div>
    );
}
