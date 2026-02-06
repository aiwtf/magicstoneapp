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
    const [language, setLanguage] = useState<Language>('EN');

    // Persist language preference
    useEffect(() => {
        const saved = localStorage.getItem('magic_stone_lang') as Language;
        if (saved && ['EN', 'TW', 'JP', 'KR'].includes(saved)) {
            setLanguage(saved);
        } else {
            // Detect browser language
            const browserLang = navigator.language;
            if (browserLang.includes('zh')) setLanguage('TW');
            else if (browserLang.includes('ja')) setLanguage('JP');
            else if (browserLang.includes('ko')) setLanguage('KR');
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
