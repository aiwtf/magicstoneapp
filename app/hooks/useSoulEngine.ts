'use client';

import { useState, useEffect } from "react";
import { SoulFragment, SoulComposite, aggregateSoul } from "../utils/soulAggregator";

import { SpotifyTrack } from "../utils/spotifyEngine";

// Legacy Type export if needed by other components temporarily
export type { SoulComposite };

export function useSoulEngine() {
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [isAbsorbing, setIsAbsorbing] = useState(false);
    const [soulComposite, setSoulComposite] = useState<SoulComposite | null>(null);
    const [playlist, setPlaylist] = useState<SpotifyTrack[]>([]);
    const [soulAnthem, setSoulAnthem] = useState<string | null>(null);

    // Initialize from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem("magic_stone_composite");
        if (saved) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSoulComposite(JSON.parse(saved));
                setProgress(100);
            } catch (e) {
                console.error("Corruption in soul storage", e);
            }
        }
        const savedAnthem = localStorage.getItem('soul_anthem');
        if (savedAnthem) setSoulAnthem(savedAnthem);
    }, []);

    const injectFragment = (fragment: SoulFragment) => {
        setIsAbsorbing(true);

        // Instant update (Video transition already provided the delay)
        setSoulComposite(prev => {
            const newComposite = aggregateSoul(prev, fragment);
            localStorage.setItem("magic_stone_composite", JSON.stringify(newComposite));
            return newComposite;
        });
        setProgress(100);
        setIsAbsorbing(false);
    };

    const injectPlaylist = (tracks: SpotifyTrack[]) => {
        setPlaylist(tracks);
    };

    const injectAnthem = (url: string) => {
        setSoulAnthem(url);
        localStorage.setItem('soul_anthem', url);
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
        injectPlaylist,
        playlist,
        soulData: soulComposite,
        injectAnthem,
        soulAnthem,
    };
}
