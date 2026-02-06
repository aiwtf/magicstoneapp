'use client';

import { useState, useEffect } from "react";
import { SoulFragment, SoulComposite, aggregateSoul } from "../utils/soulAggregator";

// Legacy Type export if needed by other components temporarily
export type { SoulComposite };

export function useSoulEngine() {
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [isAbsorbing, setIsAbsorbing] = useState(false);
    const [soulComposite, setSoulComposite] = useState<SoulComposite | null>(null);

    // Initialize from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem("magic_stone_composite");
        if (saved) {
            try {
                setSoulComposite(JSON.parse(saved));
                setProgress(100);
            } catch (e) {
                console.error("Corruption in soul storage", e);
            }
        }
    }, []);

    const injectFragment = (fragment: SoulFragment) => {
        setIsAbsorbing(true);

        // Simulate processing
        setTimeout(() => {
            setSoulComposite(prev => {
                const newComposite = aggregateSoul(prev, fragment);
                localStorage.setItem("magic_stone_composite", JSON.stringify(newComposite));
                return newComposite;
            });
            setProgress(100);
            setIsAbsorbing(false);
        }, 1200);
    };

    const absorbSoul = async (input: string) => {
        if (!input.trim()) return;
        setIsAbsorbing(true);
        // Logs are now less relevant but kept for legacy chat feel
        setLogs(prev => [...prev, `INPUT::${input}`]);
        setTimeout(() => setIsAbsorbing(false), 800);
    };

    return {
        progress,
        logs,
        isAbsorbing,
        absorbSoul,
        injectFragment,
        soulData: soulComposite,
    };
}
