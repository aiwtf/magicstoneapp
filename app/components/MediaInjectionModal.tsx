'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MediaInjectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInjectAnthem: (url: string) => void;
}

export default function MediaInjectionModal({ isOpen, onClose, onInjectAnthem }: MediaInjectionModalProps) {
    const { t } = useLanguage();
    const [url, setUrl] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleInject = () => {
        if (!url) {
            setError('Please enter a Cosmic URL');
            return;
        }
        // Simple YouTube/SoundCloud check (basic)
        if (!url.includes('youtube.com') && !url.includes('youtu.be') && !url.includes('soundcloud.com')) {
            setError('Invalid Frequency. Only YouTube links resonate here.');
            return;
        }

        onInjectAnthem(url);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                >
                    <div className="absolute inset-0" onClick={onClose} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-100 tracking-wider uppercase flex items-center gap-2">
                                    <Youtube className="w-5 h-5 text-red-500" />
                                    SOUL ANTHEM
                                </h2>
                                <p className="text-[10px] text-zinc-500 font-mono mt-1">
                                    Paste the URL of your soul's frequency
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="p-8 flex flex-col gap-6">

                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-purple-600 rounded-lg opacity-20 group-hover:opacity-50 transition duration-500 blur"></div>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => {
                                        setUrl(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder="Paste YouTube Link..."
                                    className="relative w-full bg-black border border-zinc-800 text-white rounded-lg px-4 py-4 focus:outline-none focus:border-red-500/50 font-mono text-sm placeholder-zinc-700 transition-all shadow-inner"
                                />
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-xs text-red-400"
                                >
                                    <AlertCircle className="w-3 h-3" />
                                    {error}
                                </motion.div>
                            )}

                            <button
                                onClick={handleInject}
                                className="w-full py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-800 hover:text-white hover:border-red-500/30 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Sparkles className="w-4 h-4 text-red-500 group-hover:animate-pulse" />
                                Inject Frequency
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
