'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, ExternalLink, Zap, AlertCircle, Sparkles, Bot, Brain } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { generateSystemPrompt } from '../utils/soulAlchemy';
import { extractSoulJSON } from '../utils/soulEngine'; // Keep for future JSON verify if needed, or remove if unused locally
import { SoulFragment } from '../utils/soulAggregator';

interface RitualAltarProps {
    onClose: () => void;
    onInitialize: (data: SoulFragment) => void;
}

type OracleType = 'ChatGPT' | 'Gemini' | 'Claude';

export default function RitualAltar({ onClose, onInitialize }: RitualAltarProps) {
    const { t, language } = useLanguage();
    const [step, setStep] = useState<'select' | 'await'>('select');
    const [isThinking, setIsThinking] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [selectedOracle, setSelectedOracle] = useState<OracleType | 'Unknown'>('Unknown');

    // Auto-sense return logic (simplified from previous version)
    // We can rely on the user manually clicking "Materialize" for robust feedback,
    // or keep the window focus listener. Let's keep the manual button dominant but add a pulse on focus.
    const [hasReturned, setHasReturned] = useState(false);

    // Focus listener
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleFocus = () => {
                if (step === 'await') setHasReturned(true);
            };
            window.addEventListener('focus', handleFocus);
            return () => window.removeEventListener('focus', handleFocus);
        }
    }, [step]); // Fixed dependency array

    const handleSummon = async (oracle: OracleType) => {
        setSelectedOracle(oracle);
        const prompt = generateSystemPrompt(language);

        // Step A: Magic Copy
        try {
            await navigator.clipboard.writeText(prompt);
            setCopied(true);
            // Show toast visually (implemented via UI state below)
        } catch (err) {
            console.error("Clipboard failed", err);
            // Fallback? For MVP just proceed and hope user copies manually if needed (UI not built for manual copy yet as per specs)
        }

        // Step B: Deep Linking / Redirect
        setStep('await');

        let url = '';
        let deepLink = '';

        switch (oracle) {
            case 'ChatGPT':
                deepLink = 'chatgpt://search'; // Try deep link
                url = 'https://chatgpt.com/';
                break;
            case 'Gemini':
                deepLink = 'googleapp://'; // Generic Google App
                url = 'https://gemini.google.com/';
                break;
            case 'Claude':
                url = 'https://claude.ai/new';
                break;
        }

        if (deepLink) {
            window.location.href = deepLink;
            // Fallback to web if deep link fails (timeout)
            setTimeout(() => {
                window.open(url, '_blank');
            }, 800);
        } else {
            window.open(url, '_blank');
        }
    };

    const handleMaterialize = async () => {
        setIsThinking(true);
        setError('');
        try {
            const textData = await navigator.clipboard.readText();
            // We'll try to parse loosely finding the first JSON block
            const jsonMatch = textData.match(/\{[\s\S]*"density_boost"[\s\S]*\}/);

            if (jsonMatch) {
                const rawData = JSON.parse(jsonMatch[0]);

                // Validation check
                if (!rawData.dimensions || !rawData.archetype) {
                    throw new Error("Invalid Soul Structure");
                }

                // Transform raw JSON into our new Fragment structure
                const fragment: SoulFragment = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    source: selectedOracle,
                    timestamp: Date.now(),

                    archetype_name: rawData.archetype_name || "Unknown Soul",
                    archetype_description: rawData.archetype_description || "",
                    mbti_type: rawData.mbti_type,
                    enneagram_type: rawData.enneagram_type,
                    core_tension: rawData.core_tension || "Unresolved",
                    narrative_phase: rawData.narrative_phase || "Wandering",
                    cognitive_biases: rawData.cognitive_biases || [],

                    dimensions: rawData.dimensions || {
                        structure: 50, luminosity: 50, resonance: 50, ethereal: 50,
                        volatility: 50, entropy: 50, cognitive_rigidness: 50, narrative_depth: 50
                    },

                    visual_seed: rawData.visual_seed || 'void',
                    soul_color: rawData.soul_color || '#a855f7', // Default purple for now
                    keywords: rawData.keywords || [],
                    confidence_score: rawData.confidence_score || 80
                };

                if (fragment.confidence_score < 40) {
                    setError("Soul Signal Weak. Analysis superficial. Stone will be unstable.");
                    // Proceed anyway after a longer delay to let user see the warning
                    setTimeout(() => onInitialize(fragment), 2500);
                } else {
                    setTimeout(() => onInitialize(fragment), 800);
                }

                return;
            }
            throw new Error("No ritual data found.");

        } catch (e) {
            setIsThinking(false);
            setError(e instanceof Error ? "The artifact is blurry. (Copy the JSON)" : "Unknown interference.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>

            <div className="relative w-full max-w-lg bg-zinc-900/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl">

                {/* Close */}
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 text-center space-y-2">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-light tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 uppercase font-serif"
                    >
                        {step === 'select' ? t('altar.title') : t('modal.phase2')}
                    </motion.h2>
                    <p className="text-xs text-zinc-500 tracking-widest uppercase">
                        {step === 'select' ? t('altar.desc') : t('modal.desc.portal')}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'select' ? (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-8 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                            {[
                                { id: 'ChatGPT', name: 'ChatGPT', icon: <Bot className="w-8 h-8" />, color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10' },
                                { id: 'Gemini', name: 'Gemini', icon: <Sparkles className="w-8 h-8" />, color: 'hover:border-blue-500/50 hover:bg-blue-500/10' },
                                { id: 'Claude', name: 'Claude', icon: <Brain className="w-8 h-8" />, color: 'hover:border-orange-500/50 hover:bg-orange-500/10' },
                            ].map((oracle) => (
                                <button
                                    key={oracle.id}
                                    onClick={() => handleSummon(oracle.id as OracleType)}
                                    className={`group flex flex-col items-center justify-center p-6 border border-white/5 rounded-xl transition-all duration-500 ${oracle.color}`}
                                >
                                    <span className="mb-4 group-hover:scale-110 transition-transform duration-500 text-zinc-500 group-hover:text-white">
                                        {oracle.icon}
                                    </span>
                                    <span className="text-xs font-bold tracking-widest text-zinc-600 group-hover:text-white uppercase">{oracle.name}</span>
                                </button>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="await"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-8 pt-0 space-y-6"
                        >
                            {/* Status Indicator */}
                            <div className="flex flex-col items-center justify-center gap-4 py-8">
                                <div className={`relative w-16 h-16 flex items-center justify-center rounded-full border border-white/10 ${hasReturned ? 'animate-none' : 'animate-pulse'}`}>
                                    {hasReturned ? <Zap className="w-6 h-6 text-purple-400" /> : <ExternalLink className="w-6 h-6 text-zinc-600" />}
                                    {hasReturned && <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse" />}
                                </div>
                                <p className="text-xs text-zinc-500 uppercase tracking-widest animate-pulse">
                                    {hasReturned ? t('btn.listening') : t('btn.waiting')}
                                </p>
                            </div>

                            {/* Materialize Action */}
                            <button
                                onClick={handleMaterialize}
                                disabled={isThinking}
                                className={`w-full py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-lg transition-all border ${hasReturned
                                    ? 'bg-white text-black hover:bg-zinc-200 border-white'
                                    : 'bg-black/50 text-zinc-600 border-white/10'
                                    }`}
                            >
                                {isThinking ? t('btn.divining') : t('btn.materialize')}
                            </button>

                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-red-400 text-[10px] uppercase tracking-wider">
                                    <AlertCircle className="w-3 h-3" />
                                    {error}
                                </motion.div>
                            )}

                            {copied && !error && (
                                <p className="text-center text-[10px] text-green-500/50 uppercase tracking-widest">
                                    {t('toast.copied')}
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
