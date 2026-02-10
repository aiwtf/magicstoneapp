'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { SoulComposite } from '../utils/soulAggregator';
import { Sparkles, Activity, Lock, Unlock, Eye, Brain } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SoulResultDisplayProps {
    data: SoulComposite;
    stoneIndex: number;
}

const DIMENSION_LABELS: Record<string, string> = {
    structure: "秩序 (Order)",
    luminosity: "社交 (Social)",
    resonance: "同理 (Empathy)",
    ethereal: "靈性 (Spirit)",
    volatility: "波動 (Emotion)",
    entropy: "混沌 (Complexity)",
    narrative_depth: "閱歷 (Depth)"
};

export default function SoulResultDisplay({ data, stoneIndex }: SoulResultDisplayProps) {
    const { t } = useLanguage();
    const [revealShadow, setRevealShadow] = useState(false);

    // Split Conflict if possible
    const tensionRaw = typeof data.core_tension === 'string'
        ? data.core_tension
        : (data.core_tension?.conflict || "Unresolved");

    // Try to split by 'vs' or 'vs.' or 'VS'
    const tensionParts = tensionRaw.split(/ vs\.? /i);
    const tensionLeft = tensionParts[0] || tensionRaw;
    const tensionRight = tensionParts[1] || "";

    // Dimensions Array for rendering (Filter out cognitive_rigidness to avoid NaN)
    const dimList = Object.entries(data.dimensions)
        .filter(([key]) => key !== 'cognitive_rigidness')
        .map(([key, value]) => {
            // Map keys to translations
            let labelKey = `soul.radar.${key}`;
            if (key === 'structure') labelKey = 'soul.radar.order';
            if (key === 'luminosity') labelKey = 'soul.radar.social';
            if (key === 'resonance') labelKey = 'soul.radar.empathy';
            if (key === 'ethereal') labelKey = 'soul.radar.spirit';
            if (key === 'volatility') labelKey = 'soul.radar.emotion';
            if (key === 'entropy') labelKey = 'soul.radar.complexity';
            if (key === 'narrative_depth') labelKey = 'soul.radar.depth';

            return {
                key,
                label: t(labelKey),
                value: value as number
            };
        });

    return (
        <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center gap-12 font-serif text-zinc-100 pb-20">

            {/* 1. Top Header: Title Only */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-center z-10 w-full"
            >
                <div className="inline-block relative">
                    <h1
                        className="text-sm font-light tracking-[0.5em] uppercase text-white/30 select-none"
                    >
                        {data.archetype_name}
                    </h1>
                </div>
            </motion.div>

            {/* 2. The Main Stage: Stone Container (HUD Style) */}
            <div className="relative w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-12 md:gap-16">

                {/* Left Tension (Flanking) — pushes toward stone */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="hidden md:flex flex-col items-end text-right space-y-2 pr-8"
                >
                    <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">{t('soul.tension.a')}</span>
                    <span className="text-xl font-light text-white/90 border-r-2 border-white/10 pr-6">
                        {tensionLeft || "..."}
                    </span>
                </motion.div>

                {/* Center: The Stone & Absolute HUD Labels */}
                <div className="relative w-full md:w-[500px] h-[500px] flex items-center justify-center">

                    {/* HUD Label: MBTI (Top-Left) */}
                    {data.mbti_type && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.5 }}
                            className="absolute top-10 left-0 md:left-6 z-20"
                        >
                            <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">MBTI</div>
                            <span className="text-2xl md:text-3xl font-bold text-white/80 font-sans tracking-widest select-none pointer-events-none">
                                {data.mbti_type}
                            </span>
                        </motion.div>
                    )}

                    {/* HUD Label: Enneagram (Top-Right) */}
                    {data.enneagram_type && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.6 }}
                            className="absolute top-10 right-0 md:right-6 z-20 text-right"
                        >
                            <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">{t('soul.enneagram')}</div>
                            <div className="text-xl md:text-2xl font-bold text-white/80 font-mono tracking-widest">
                                {data.enneagram_type}
                            </div>
                        </motion.div>
                    )}

                    {/* Background Connection Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent -z-10 hidden md:block"></div>

                    {/* Glow */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, delay: 0.8 }}
                        className="absolute inset-0 rounded-full opacity-20 blur-3xl"
                        style={{ backgroundColor: data.soul_color }}
                    />

                    {/* Stone Image */}
                    <motion.img
                        src={`/stones/${stoneIndex}.jpg`}
                        alt="Soul Vessel"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="w-full h-full object-contain drop-shadow-2xl z-10"
                        style={{ mixBlendMode: 'screen' }}
                    />
                </div>

                {/* Right Tension (Flanking) — pushes away from stone */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="hidden md:flex flex-col items-start text-left space-y-2 pl-8"
                >
                    <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">{t('soul.tension.b')}</span>
                    <span className="text-xl font-light text-white/90 border-l-2 border-white/10 pl-6">
                        {tensionRight || "..."}
                    </span>
                </motion.div>

                {/* Mobile Tension Fallback */}
                <div className="md:hidden text-center col-span-1 space-y-2 mt-4">
                    <span className="text-xs text-zinc-500 uppercase">Core Tension</span>
                    <div className="text-lg text-white">
                        {tensionLeft} <span className="text-zinc-500 mx-2">vs</span> {tensionRight}
                    </div>
                </div>

            </div>

            {/* 3. Bottom Narrative (Essence Summary) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
                className="w-full max-w-3xl mx-auto text-center px-4 md:px-0"
            >
                <div className="p-8 bg-zinc-900/20 border-y border-white/5 backdrop-blur-sm">
                    <p className="text-lg md:text-xl leading-relaxed text-zinc-300 font-serif italic">
                        "{data.archetype_description || "A soul waiting to be defined..."}"
                    </p>
                </div>
            </motion.div>

            {/* 4. Soul Dimensions Layout */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0 }}
                className="w-full max-w-2xl bg-zinc-900/40 border border-white/5 rounded-2xl p-8 backdrop-blur-sm mt-8"
            >
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <Activity className="w-5 h-5 text-zinc-400" />
                    <h3 className="text-lg font-light tracking-widest uppercase text-zinc-200">{t('soul.radar.title')}</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {dimList.map((dim, i) => (
                        <div key={dim.key} className="flex items-center gap-4 group">
                            <div className="w-32 text-xs text-zinc-400 text-right uppercase tracking-wider group-hover:text-white transition-colors">
                                {dim.label}
                            </div>
                            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${dim.value}%` }}
                                    transition={{ duration: 1.5, delay: 2.0 + (i * 0.1), ease: "easeOut" }}
                                    className="h-full bg-white relative"
                                    style={{
                                        backgroundColor: dim.key === 'entropy' ? '#ef4444' : (dim.key === 'narrative_depth' ? '#eab308' : 'white'),
                                        boxShadow: `0 0 10px ${dim.key === 'entropy' ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.3)'}`
                                    }}
                                />
                            </div>
                            <div className="w-12 text-xs font-mono text-zinc-500 text-right">
                                {dim.value}%
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* 5. The Shadow Reveal */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2 }}
                className="w-full max-w-2xl space-y-6"
            >
                <div className="flex items-center gap-3 justify-center mb-2">
                    <Eye className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-300 uppercase tracking-[0.3em]">{t('soul.anatomy.title')}</span>
                </div>

                <div
                    onClick={() => setRevealShadow(true)}
                    className="relative cursor-pointer group"
                >
                    <div className={`
                        p-8 bg-black/40 border border-purple-500/20 rounded-2xl text-center space-y-4 transition-all duration-700
                        ${revealShadow ? 'bg-purple-900/10 border-purple-500/40' : 'hover:border-purple-500/40'}
                    `}>
                        <h4 className="text-sm text-zinc-400 uppercase tracking-widest">
                            {revealShadow ? t('soul.anatomy.shadow') : t('soul.anatomy.shadow')}
                        </h4>

                        <div className="relative min-h-[80px] flex items-center justify-center">
                            <p className={`
                                text-lg md:text-xl font-serif text-purple-100/90 leading-relaxed max-w-lg mx-auto transition-all duration-1000
                                ${revealShadow ? 'filter-none' : 'blur-md select-none opacity-50'}
                            `}>
                                {data.depth_analysis?.shadow_traits || "Shadow data obscured..."}
                            </p>

                            {!revealShadow && (
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <div className="px-6 py-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-full text-xs uppercase tracking-widest text-white flex items-center gap-2 group-hover:scale-105 transition-transform">
                                        <Lock className="w-3 h-3" /> {t('soul.click_reveal')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Karmic Lesson & Operating System Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-xl space-y-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">{t('soul.anatomy.os')}</span>
                        <p className="text-sm text-zinc-300">
                            {data.operating_system?.decision_model || "Calculating..."}
                        </p>
                    </div>
                    <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-xl space-y-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">{t('soul.anatomy.karma')}</span>
                        <p className="text-sm text-zinc-300">
                            {data.depth_analysis?.karmic_lesson || data.depth_analysis?.karmic_anchor || "Unknown"}
                        </p>
                    </div>
                </div>

            </motion.div>

        </div>
    );
}
