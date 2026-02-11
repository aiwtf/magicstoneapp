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
    const [step, setStep] = useState<'select' | 'guide' | 'await'>('select');
    const [isThinking, setIsThinking] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [selectedOracle, setSelectedOracle] = useState<OracleType | 'Unknown'>('Unknown');

    const [manualInput, setManualInput] = useState("");

    // Auto-sense return logic (simplified from previous version)
    // We can rely on the user manually clicking "Materialize" for robust feedback,
    // or keep the window focus listener. Let's keep the manual button dominant but add a pulse on focus.
    const [hasReturned, setHasReturned] = useState(false);
    const [isMaterializing, setIsMaterializing] = useState(false);
    const [pendingFragment, setPendingFragment] = useState<SoulFragment | null>(null);

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

        // 1. Static Nonce (Pausing Dynamic Verification)
        const nonce = "P5KYnoQx";
        localStorage.setItem("magic_stone_active_nonce", nonce);

        // 2. Generate Prompt with Nonce
        const prompt = generateSystemPrompt(language, nonce);

        // Step A: Magic Copy (DISABLED per Phase 1 UX Simplification)
        // try {
        //     await navigator.clipboard.writeText(prompt);
        //     setCopied(true);
        // } catch (err) {
        //     console.error("Clipboard failed", err);
        // }

        // Show Guide Modal instead of immediate redirect
        setStep('guide');
    };

    const handleOpenApp = () => {
        setStep('await');

        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        let webUrl = '';
        let appScheme = '';

        switch (selectedOracle) {
            case 'ChatGPT':
                // iOS/Android Scheme for ChatGPT
                appScheme = 'chatgpt://conversation';
                webUrl = 'https://chatgpt.com/';
                break;
            case 'Gemini':
                // Gemini is often in Google App or standalone on Android
                // On iOS, googleapp:// opens the Google App. 
                // There isn't a dedicated "gemini://" scheme widely supported yet, 
                // but universal links to gemini.google.com usually work.
                appScheme = 'googleapp://';
                webUrl = 'https://gemini.google.com/app';
                break;
            case 'Claude':
                webUrl = 'https://claude.ai/new';
                break;
        }

        if (isMobile && appScheme) {
            // Attempt to open App ONLY
            // If app is not installed, nothing happens (per user request)
            window.location.href = appScheme;
        } else {
            // Desktop: Direct Web Open
            window.open(webUrl, '_blank');
        }
    };

    const handleMaterialize = async (inputText: string = "") => {
        setIsThinking(true);
        setError('');
        try {
            // Use manual input preferentially, fallback to clipboard only if empty (desktop convenience)
            // But on mobile, clipboard read often fails, so manual input is key.
            let textData = inputText.trim();

            if (!textData) {
                try {
                    textData = await navigator.clipboard.readText();
                } catch (e) {
                    throw new Error("⚠️ 請長按輸入框貼上 AI 回覆 (Please paste AI response)");
                }
            }

            // Robust parsing via soulEngine
            const rawData = extractSoulJSON(textData);

            // --- VERIFICATION CHECK ---
            const activeNonce = localStorage.getItem("magic_stone_active_nonce");
            if (rawData.verification_code && activeNonce && rawData.verification_code !== activeNonce) {
                console.warn(`Nonce Mismatch: Expected ${activeNonce}, Got ${rawData.verification_code}`);
                // We will allow it but maybe set a flag or show a toast?
                // For now, let's treat it as valid but log it. 
                // Strict mode might block it, but let's be lenient for demo.
            }
            // ---------------------------

            // Transform raw JSON into our new Fragment structure
            const fragment: SoulFragment = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                source: selectedOracle,
                timestamp: Date.now(),

                soul_title: rawData.soul_title || rawData.archetype?.name || "Unknown Soul",
                archetype_name: rawData.soul_title || rawData.archetype?.name || "Unknown Soul",
                archetype_description: rawData.essence_summary || rawData.archetype?.description || "",
                essence_summary: rawData.essence_summary || rawData.archetype?.description || "",

                // Truth Protocol: Synchronization Metadata
                synchronization: rawData.synchronization || { level: 1, rate: 30, missing_data_reason: "No synchronization data from AI", is_ready_for_matching: false },

                // Deep Protocol Mapping (Nullable per Truth Protocol)
                core_tension: rawData.core_tension,
                operating_system: rawData.operating_system,
                depth_analysis: rawData.depth_analysis,
                matching_protocol: rawData.matching_protocol || null,
                resonance_meta: rawData.resonance,

                mbti_type: rawData.archetype?.mbti || "Unknown",
                enneagram_type: rawData.archetype?.enneagram || "Unknown",
                narrative_phase: "Wandering",
                cognitive_biases: rawData.operating_system?.cognitive_bias ? [rawData.operating_system.cognitive_bias] : [],

                // Force non-null dimensions (handled by deriveDimensions in soulEngine)
                dimensions: rawData.dimensions!,

                visual_seed: 'void',
                soul_color: rawData.soul_color || '#a855f7',
                keywords: rawData.keywords || [],
                confidence_score: rawData.confidence_score || 80
            };

            setPendingFragment(fragment);

            // Play the video transition regardless of score (it's the ritual!)
            // But if score is low, maybe we show error first?
            // Let's follow the "Ceremony" logic: Video plays immediately to build tension.

            if (fragment.confidence_score < 40) {
                setError("Soul Signal Weak. Analysis superficial. Stone will be unstable.");
                // Delay slightly to show error, then play video
                setTimeout(() => setIsMaterializing(true), 1500);
            } else {
                setIsMaterializing(true);
            }

            return;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            setIsThinking(false);
            console.error(e);
            setError(e.message || "Could not find the Soul Signature. Did you copy the FULL AI response?");
        }
    };

    const handleVideoEnd = () => {
        setIsMaterializing(false);
        if (pendingFragment) {
            onInitialize(pendingFragment);
        }
    };

    // Safety timeout for video
    useEffect(() => {
        if (isMaterializing) {
            const timer = setTimeout(handleVideoEnd, 5000); // Max 5s transition
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMaterializing]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            {/* Video Transition Overlay */}
            <AnimatePresence>
                {isMaterializing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex items-center justify-center pointer-events-auto"
                        onClick={handleVideoEnd} // Click to skip
                    >
                        <video
                            src="/input.mp4"
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                            onEnded={handleVideoEnd}
                            onError={(e) => { console.error("Video Failed", e); handleVideoEnd(); }}
                        />
                        <div className="absolute bottom-10 text-white/50 text-xs tracking-widest uppercase animate-pulse">
                            Tap to Skip
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                    {step === 'select' && (
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
                    )}

                    {step === 'guide' && (
                        <motion.div
                            key="guide"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-8 pt-0 space-y-6 text-left"
                        >
                            {/* Step 1: Explicit Copy */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-zinc-400 text-[10px] uppercase tracking-widest">
                                    <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold">1</div>
                                    <span>{t('altar.label.source')}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        const storedNonce = localStorage.getItem("magic_stone_active_nonce") || "P5KYnoQx";
                                        const prompt = generateSystemPrompt(language, storedNonce);
                                        navigator.clipboard.writeText(prompt);
                                        setCopied(true);
                                        // Optional: Toast logic integration if needed, local state for checkmark
                                    }}
                                    className={`w-full py-4 rounded-xl border flex items-center justify-center gap-2 transition-all duration-300 ${copied ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-zinc-800/50 border-white/10 hover:bg-zinc-800 hover:border-white/30 text-white'}`}
                                >
                                    {copied ? <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />{t('altar.step1.toast')}</div> : <><Copy className="w-4 h-4" /> {t('altar.step1.btn')}</>}
                                </button>
                            </div>

                            {/* Step 2: Instruction */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-zinc-400 text-[10px] uppercase tracking-widest">
                                    <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold">2</div>
                                    <span>{t('altar.label.instruction')}</span>
                                </div>
                                <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 text-xs text-zinc-300 leading-relaxed">
                                    {t('altar.step2.desc')}
                                </div>
                            </div>

                            {/* Step 3: Open App (No Header) */}
                            <div className="space-y-2 pt-2">
                                <button
                                    onClick={handleOpenApp}
                                    className="w-full py-4 text-xs font-bold uppercase tracking-[0.2em] bg-white text-black hover:bg-zinc-200 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                                >
                                    {/* Dynamic Label Logic */}
                                    {selectedOracle === 'ChatGPT' && t('btn.open.chatgpt')}
                                    {selectedOracle === 'Gemini' && t('btn.open.gemini')}
                                    {selectedOracle === 'Claude' && t('btn.open.claude')}
                                    {!['ChatGPT', 'Gemini', 'Claude'].includes(selectedOracle) && t('altar.step3.btn')}

                                    <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>

                        </motion.div>
                    )}

                    {step === 'await' && (
                        <motion.div
                            key="await"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-8 pt-0 space-y-4"
                        >
                            {/* Manual Input Area */}
                            <div className="w-full flex flex-col gap-4">
                                <p className="text-xs text-zinc-400 text-center uppercase tracking-widest">
                                    {t('btn.waiting')}
                                </p>
                                <textarea
                                    className="w-full h-32 bg-zinc-900/50 border border-zinc-700 rounded-lg p-3 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600 resize-none font-mono"
                                    placeholder="Paste the full AI response here..."
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                />

                                <button
                                    onClick={() => handleMaterialize(manualInput)}
                                    disabled={isThinking}
                                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs shadow-lg shadow-purple-900/20"
                                >
                                    {isThinking ? t('btn.divining') : "🔮 " + t('btn.materialize')}
                                </button>
                            </div>

                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-red-400 text-[10px] uppercase tracking-wider text-center">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
