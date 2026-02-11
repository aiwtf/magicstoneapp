'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Sparkles, AlertCircle, ExternalLink, Zap } from 'lucide-react';
import { generateNonce, generateIncantation, extractSoulJSON, SoulJSON } from '../utils/soulEngine';
import { useLanguage } from '../contexts/LanguageContext';

interface IncantationModalProps {
    onInitialize: (data: SoulJSON) => void;
}

export default function IncantationModal({ onInitialize }: IncantationModalProps) {
    const { t } = useLanguage();
    const [step, setStep] = useState<'copy' | 'await'>('copy');
    const [error, setError] = useState('');
    const [nonce, setNonce] = useState('');
    const [incantation, setIncantation] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [hasReturned, setHasReturned] = useState(false);

    useEffect(() => {
        const newNonce = generateNonce();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNonce(newNonce);
        setIncantation(generateIncantation(newNonce));

        // Auto-sense return logic
        const handleFocus = () => {
            // Only auto-sense if we are in the await phase
            if (step === 'await') {
                setHasReturned(true);
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [step]); // step dependency important here

    const copyIncantation = () => {
        navigator.clipboard.writeText(incantation);
        setStep('await');
    };

    const handleMaterialize = async () => {
        setIsThinking(true);
        setError('');
        try {
            const text = await navigator.clipboard.readText();
            const data = extractSoulJSON(text);

            // "Data Burn" Effect
            // Artificial delay to simulate processing/burning
            setTimeout(() => {
                onInitialize(data);
            }, 800);
        } catch (e) {
            setIsThinking(false);
            setError(e instanceof Error ? e.message : "No Soul Resonance detected in clipboard.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">

                {/* Header */}
                <div className="p-6 border-b border-zinc-800/50 text-center">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 tracking-widest uppercase">
                        {t('modal.title')}
                    </h2>
                    <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">
                        {step === 'copy' ? t('modal.phase1') : t('modal.phase2')}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <AnimatePresence mode="wait">
                        {step === 'copy' ? (
                            <motion.div
                                key="step-copy"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                <p className="text-sm text-zinc-400 text-center font-light">
                                    {t('modal.desc.copy')}
                                </p>

                                <button
                                    onClick={copyIncantation}
                                    className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold uppercase tracking-widest rounded-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                >
                                    <Copy className="w-4 h-4" />
                                    {t('btn.copy')}
                                </button>

                                {/* Privacy Note */}
                                <div className="mt-4 p-3 bg-zinc-900/80 rounded border border-zinc-800 text-[10px] text-zinc-500 leading-relaxed text-center">
                                    <p>{t('note.privacy')}</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step-portal"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <p className="text-sm text-zinc-400 text-center font-light">
                                    {t('modal.desc.portal')}
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <a
                                        href="https://chatgpt.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center justify-center p-4 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg border border-zinc-700 hover:border-green-500/50 transition-all group"
                                    >
                                        <ExternalLink className="w-5 h-5 mb-2 text-green-400 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold text-zinc-300">{t('btn.open.chatgpt')}</span>
                                    </a>
                                    <a
                                        href="https://gemini.google.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center justify-center p-4 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg border border-zinc-700 hover:border-blue-500/50 transition-all group"
                                    >
                                        <ExternalLink className="w-5 h-5 mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold text-zinc-300">{t('btn.open.gemini')}</span>
                                    </a>
                                </div>

                                <div className="py-2"></div>

                                {/* Materialize Button - Pulses when returned */}
                                <button
                                    onClick={handleMaterialize}
                                    className={`w-full py-5 font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 relative overflow-hidden ${hasReturned
                                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_30px_rgba(147,51,234,0.5)] animate-pulse'
                                        : 'bg-zinc-800 text-zinc-500'
                                        }`}
                                >
                                    {isThinking ? (
                                        <span className="animate-pulse">{t('btn.divining')}</span>
                                    ) : (
                                        <>
                                            <Zap className={`w-4 h-4 ${hasReturned ? 'fill-current' : ''}`} />
                                            {hasReturned ? t('btn.materialize') : t('btn.waiting')}
                                        </>
                                    )}
                                </button>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-xs text-red-400 text-center flex items-center justify-center gap-1"
                                    >
                                        <AlertCircle className="w-3 h-3" />
                                        {error}
                                    </motion.p>
                                )}

                                {!hasReturned && (
                                    <p className="text-[10px] text-zinc-600 text-center animate-pulse">
                                        {t('btn.listening')}
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
