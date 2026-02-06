'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../translations';

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage();

    const languageMap: Record<Language, string> = {
        'en': 'English',
        'zh-CN': '简体中文',
        'zh-TW': '繁體中文',
        'ko': '한국어',
        'pl': 'Polski',
        'ja': '日本語',
        'es': 'Español',
        'de': 'Deutsch',
        'it': 'Italiano',
        'id': 'Bahasa Indonesia',
        'ru': 'Русский',
        'vn': 'Tiếng Việt'
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-black/80 backdrop-blur-md text-zinc-300 text-xs tracking-widest uppercase border border-white/20 rounded px-3 py-2 outline-none hover:border-white/50 transition-colors cursor-pointer"
            >
                {Object.entries(languageMap).map(([code, name]) => (
                    <option key={code} value={code} className="bg-zinc-900 text-zinc-300">
                        {name}
                    </option>
                ))}
            </select>
        </div>
    );
}
