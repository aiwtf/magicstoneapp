'use client';

import { motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";

interface SoulReadingProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        soul_color: string;
        keywords: string[];
        summary: string;
    } | null;
}

export default function SoulReadingModal({ isOpen, onClose, data }: SoulReadingProps) {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateX: 10 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-full max-w-lg p-8 rounded-3xl bg-black border border-white/10 shadow-2xl overflow-hidden text-center"
            >
                {/* Aura Background */}
                <div
                    className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20 blur-[100px] pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${data.soul_color}, transparent 70%)` }}
                ></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>

                <div className="relative z-10 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-bold tracking-widest uppercase text-white mb-1">
                            Soul Awakened
                        </h2>
                        <div className="flex justify-center gap-2 mb-6">
                            {data.keywords.map((kw, i) => (
                                <span key={i}
                                    className="px-3 py-1 text-xs rounded-full border border-white/20 bg-white/5 tracking-wider"
                                    style={{ borderColor: data.soul_color }}
                                >
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-lg leading-relaxed text-gray-200 font-light italic"
                    >
                        "{data.summary}"
                    </motion.div>

                    <div className="pt-4">
                        <div
                            className="w-16 h-1 bg-white/20 mx-auto rounded-full"
                            style={{ background: data.soul_color }}
                        ></div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
