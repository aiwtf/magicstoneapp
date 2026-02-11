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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLanguage(saved);
        }
        // If no saved language, it remains 'en' (default state).
        // We strictly ignore navigator.language for new users.
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
