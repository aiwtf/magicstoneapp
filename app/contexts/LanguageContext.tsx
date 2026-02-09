'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { translations, Language } from '../translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    // Persist language preference
    useEffect(() => {
        const saved = localStorage.getItem('magic_stone_lang') as Language;
        // Simple valid check
        if (saved && translations[saved]) {
            setLanguage(saved);
        } else {
            // 1. Force Default to English (Per User Request)
            // The app must load in English (en) by default for new users.
            // We ignore navigator.language unless the user manually switches.
            setLanguage('en');

            // Legacy Auto-detect (Disabled for now)
            /*
            const browserLang = navigator.language;
            if (browserLang.includes('zh-CN')) setLanguage('zh-CN');
            else if (browserLang.includes('zh')) setLanguage('zh-TW');
            else if (browserLang.includes('ja')) setLanguage('ja');
            else if (browserLang.includes('ko')) setLanguage('ko');
            else if (browserLang.includes('es')) setLanguage('es');
            else if (browserLang.includes('de')) setLanguage('de');
            else if (browserLang.includes('it')) setLanguage('it');
            else if (browserLang.includes('id')) setLanguage('id');
            else if (browserLang.includes('ru')) setLanguage('ru');
            else if (browserLang.includes('vi')) setLanguage('vn');
            else if (browserLang.includes('pl')) setLanguage('pl');
            */
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('magic_stone_lang', lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
