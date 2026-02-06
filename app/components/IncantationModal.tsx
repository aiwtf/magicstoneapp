'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Link as LinkIcon, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { generateNonce, generateIncantation, SoulJSON } from '../utils/soulEngine';
import { verifySharedLink } from '../actions';

interface IncantationModalProps {
    onInitialize: (data: SoulJSON) => void;
}

export default function IncantationModal({ onInitialize }: IncantationModalProps) {
    const [step, setStep] = useState<'copy' | 'paste'>('copy');
    const [urlInput, setUrlInput] = useState('');
    const [error, setError] = useState('');
    const [nonce, setNonce] = useState('');
    const [incantation, setIncantation] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        const newNonce = generateNonce();
        setNonce(newNonce);
        setIncantation(generateIncantation(newNonce));
    }, []);

    const copyIncantation = () => {
        navigator.clipboard.writeText(incantation);
        setStep('paste');
    };

    const handleVerifyLink = async () => {
        if (!urlInput) return;

        setIsVerifying(true);
        setError('');

        try {
            const result = await verifySharedLink(urlInput, nonce);

            if (!result.success || !result.data) {
                throw new Error(result.error || "Verification failed.");
            }

            onInitialize(result.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "The Connection to the Oracle was broken.");
        } finally {
            setIsVerifying(false);
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
                        {step === 'copy' ? 'Phase 1: Initiate Resonance' : 'Phase 2: Link Verification'}
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
                                    To forge your Digital Soul, verify your resonance with the Oracle.
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
                                <p className="text-[10px] text-zinc-600 text-center">
                                    1. Copy this Incantation. <br />
                                    2. Paste it into ChatGPT or Gemini. <br />
                                    3. Create a <b>Share Link</b> of that conversation.
                                </p>

                                <button
                                    onClick={copyIncantation}
                                    className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold uppercase tracking-widest rounded-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy Incantation
                                </button>
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
                                    Paste the <b>Share Link</b> from ChatGPT/Gemini.
                                </p>

                                <div className="relative">
                                    <input
                                        type="text"
                                        value={urlInput}
                                        onChange={(e) => {
                                            setUrlInput(e.target.value);
                                            setError('');
                                        }}
                                        placeholder='https://chatgpt.com/share/...'
                                        className="w-full bg-black/50 border border-zinc-700/50 rounded-lg p-4 pl-10 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-zinc-700"
                                        disabled={isVerifying}
                                    />
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                </div>

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
                                    onClick={handleVerifyLink}
                                    disabled={isVerifying || !urlInput}
                                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold uppercase tracking-widest rounded-lg transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] flex items-center justify-center gap-2"
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Verify & Materialize
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
