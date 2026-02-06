'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Sparkles, AlertCircle } from 'lucide-react';
import { generateNonce, generateIncantation, validateSoulJSON, SoulJSON } from '../utils/soulEngine';

interface IncantationModalProps {
    onInitialize: (data: SoulJSON) => void;
}

export default function IncantationModal({ onInitialize }: IncantationModalProps) {
    const [step, setStep] = useState<'copy' | 'paste'>('copy');
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState('');
    const [nonce, setNonce] = useState('');
    const [incantation, setIncantation] = useState('');

    useEffect(() => {
        const newNonce = generateNonce();
        setNonce(newNonce);
        setIncantation(generateIncantation(newNonce));
    }, []);

    const copyIncantation = () => {
        navigator.clipboard.writeText(incantation);
        setStep('paste');
    };

    const handleVerify = () => {
        try {
            const data = validateSoulJSON(jsonInput, nonce);
            onInitialize(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Soul Resonance Failed.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">

                {/* Header */}
                <div className="p-6 border-b border-zinc-800/50 text-center">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 tracking-widest uppercase">
                        Soul Extraction
                    </h2>
                    <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">
                        {step === 'copy' ? 'Phase 1: Initiate Resonance' : 'Phase 2: Materialize Soul'}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <AnimatePresence mode="wait">
                        {step === 'copy' ? (
                            <motion.div
                                key="step-copy"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="space-y-4"
                            >
                                <p className="text-sm text-zinc-400 leading-relaxed text-center font-light">
                                    To forge your Digital Soul, we must first resonate with your past echoes.
                                </p>

                                <div className="bg-black/80 p-4 rounded-lg border border-zinc-800 font-mono text-[10px] text-zinc-500 relative group overflow-hidden max-h-32">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none"></div>
                                    <div className="opacity-50">
                                        {incantation}
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
                                        <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
                                    </div>
                                </div>

                                <button
                                    onClick={copyIncantation}
                                    className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold uppercase tracking-widest rounded-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy Incantation
                                </button>

                                <p className="text-[10px] text-zinc-600 text-center">
                                    Paste this into your AI Spirit Guide (ChatGPT/Gemini)
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step-paste"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <p className="text-sm text-zinc-400 text-center font-light">
                                    Receive the offering. Paste the Soul Artifact below.
                                </p>

                                <textarea
                                    value={jsonInput}
                                    onChange={(e) => {
                                        setJsonInput(e.target.value);
                                        setError('');
                                    }}
                                    placeholder='Paste the JSON response here...'
                                    className="w-full h-32 bg-black/50 border border-zinc-700/50 rounded-lg p-3 text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500/50 resize-none transition-colors placeholder:text-zinc-700"
                                />

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 text-red-400 text-xs justify-center bg-red-900/10 p-2 rounded"
                                    >
                                        <AlertCircle className="w-3 h-3" />
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    onClick={handleVerify}
                                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest rounded-lg transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Materialize Stone
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
