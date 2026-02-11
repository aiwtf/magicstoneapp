'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../translations';
import { Check, Globe } from 'lucide-react';

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const languageConfig: Record<Language, { name: string; flag: string }> = {
        'en': { name: 'English', flag: '🇺🇸' },
        'zh-TW': { name: '繁體中文', flag: '🇹🇼' },
        'zh-CN': { name: '简体中文', flag: '🇨🇳' },
        'ja': { name: '日本語', flag: '🇯🇵' },
        'ko': { name: '한국어', flag: '🇰🇷' },
        'es': { name: 'Español', flag: '🇪🇸' },
        'de': { name: 'Deutsch', flag: '🇩🇪' },
        'it': { name: 'Italiano', flag: '🇮🇹' },
        'pl': { name: 'Polski', flag: '🇵🇱' },
        'ru': { name: 'Русский', flag: '🇷🇺' },
        'id': { name: 'Bahasa Indonesia', flag: '🇮🇩' },
        'vn': { name: 'Tiếng Việt', flag: '🇻🇳' }
    };

    const currentConfig = languageConfig[language] || languageConfig['en'];

    return (
        <div
            ref={containerRef}
            className="absolute top-4 right-4 z-[60]"
        >
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg hover:bg-black/60 hover:border-white/30 transition-all duration-300"
            >
                <span className="text-xl leading-none filter drop-shadow-md">
                    {currentConfig.flag}
                </span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-12 right-0 w-48 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1"
                    >
                        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                            {Object.entries(languageConfig).map(([code, config]) => (
                                <button
                                    key={code}
                                    onClick={() => {
                                        setLanguage(code as Language);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${language === code
                                            ? 'bg-white/10 text-white font-medium'
                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg leading-none">{config.flag}</span>
                                        <span>{config.name}</span>
                                    </div>
                                    {language === code && (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
