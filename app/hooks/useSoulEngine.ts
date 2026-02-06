'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'magic-stone-storage';

interface SoulData {
    progress: number;
    logs: string[];
}

export function useSoulEngine() {
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [isAbsorbing, setIsAbsorbing] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data: SoulData = JSON.parse(stored);
                setProgress(data.progress || 0);
                setLogs(data.logs || []);
            }
        } catch (e) {
            console.error("Failed to load soul data", e);
        }
    }, []);

    // Save to LocalStorage whenever state changes
    useEffect(() => {
        if (progress === 0 && logs.length === 0) return; // Don't save initial empty state if not needed

        const data: SoulData = { progress, logs };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [progress, logs]);

    const absorbSoul = (text: string) => {
        if (!text.trim()) return;

        setIsAbsorbing(true);

        // Calculate growth: 1% to 5% based on length (max 100%)
        // Short text: 1%, Long text (>100 chars): 5%
        const growth = Math.min(5, Math.max(1, Math.ceil(text.length / 20)));

        setTimeout(() => {
            setProgress((prev) => Math.min(100, prev + growth));
            setLogs((prev) => [...prev, text]);
            setIsAbsorbing(false);
        }, 2000); // Animation duration matches the stone's reaction time
    };

    const initializeSoul = (data: { soul_color: string; keywords: string[]; summary: string }) => {
        setProgress(100);
        // We might want to store the "soul reading" separately, or put it in logs?
        // For now, let's assume the component handling this will also set the 'reading' state in the parent,
        // but we should store the fact that we are "awakened" in local storage.
        // Let's modify the data structure slightly or just use progress=100 as the flag.

        // Actually, to make it robust, let's emit the event or just rely on state.
        // We will save a special log entry to mark initialization.
        const initLog = `SOUL_INIT_JSON::${JSON.stringify(data)}`;
        setLogs((prev) => [...prev, initLog]);
    };

    return {
        progress,
        logs,
        isAbsorbing,
        absorbSoul,
        initializeSoul
    };
}
