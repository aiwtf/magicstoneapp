'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../translations';

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage();
    const languages: Language[] = ['EN', 'TW', 'JP', 'KR'];

    return (
        <div className="absolute top-6 right-6 z-50 flex gap-4 text-xs tracking-widest font-light">
            {languages.map((lang) => (
                <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`relative px-2 py-1 transition-colors duration-500 uppercase ${language === lang ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                >
                    {lang}
                    {language === lang && (
                        <motion.div
                            layoutId="lang-underline"
                            className="absolute bottom-0 left-0 right-0 h-[1px] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                        />
                    )}
                </button>
            ))}
        </div>
    );
}
