'use client';
import { QRCodeSVG } from 'qrcode.react';
import { SoulComposite } from '../utils/soulAggregator';

interface ArtifactCardProps {
    data: SoulComposite;
}

export default function ArtifactCard({ data }: ArtifactCardProps) {
    const isLegendary = data.density >= 0.8;
    // Use first fragment ID or random fallback if somehow empty
    const soulId = data.fragments && data.fragments[0] ? data.fragments[0].id : 'genesis';
    const shareUrl = `https://magicstone.app/soul/${soulId}`;

    // Dynamic Style for the Stone Representation
    const stoneStyle = {
        background: isLegendary
            ? `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8) 0%, ${data.soul_color} 40%, #000 100%)` // Shiny Gem
            : `radial-gradient(circle at 30% 30%, ${data.soul_color}, #1a1a1a)`, // Dull Stone
        boxShadow: isLegendary
            ? `0 0 30px ${data.soul_color}80, inset 0 0 20px rgba(255,255,255,0.5)` // Glowing Aura
            : 'none'
    };

    return (
        <div className="relative w-80 h-[480px] bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col items-center p-6 text-center select-none group">
            {/* Decorative Border */}
            <div className="absolute inset-2 border border-white/10 rounded-lg pointer-events-none" />

            {/* Header */}
            <div className="mt-4 space-y-2 z-10 w-full px-6 text-center relative">
                <h3 className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase">Soulbound Artifact</h3>

                {/* Archetype & Narrative Phase */}
                <div>
                    <h2 className="text-xl font-serif text-white tracking-wide">{data.archetype_name || (data as any).archetype}</h2>
                    {data.narrative_phase && (
                        <p className="text-[10px] text-zinc-400 font-light italic mt-1">
                            Phase: {data.narrative_phase}
                        </p>
                    )}
                </div>

                {/* Badges (MBTI / Enneagram) */}
                <div className="flex justify-center gap-2 mt-2">
                    {data.mbti_type && (
                        <span className="text-[9px] font-mono border border-zinc-700 bg-zinc-900/50 px-2 py-1 rounded-full text-cyan-400 shadow-sm">
                            {data.mbti_type}
                        </span>
                    )}
                    {data.enneagram_type && (
                        <span className="text-[9px] font-mono border border-zinc-700 bg-zinc-900/50 px-2 py-1 rounded-full text-purple-400 shadow-sm">
                            {data.enneagram_type}
                        </span>
                    )}
                </div>
            </div>

            {/* Visual Core */}
            <div className="relative w-64 h-64 my-4 flex items-center justify-center">
                <div
                    className="w-48 h-48 rounded-full border-4 border-double border-white/10 flex items-center justify-center bg-black/50 overflow-hidden relative transition-transform duration-700 group-hover:scale-105"
                    style={stoneStyle}
                >
                    {/* Add a hard light reflection overlay for gem effect */}
                    {isLegendary && (
                        <div className="absolute top-8 left-8 w-12 h-8 bg-white/90 rounded-full blur-[2px] opacity-90 mix-blend-overlay rotate-[-45deg]" />
                    )}

                    {/* Low density texture fallback */}
                    {!isLegendary && (
                        <div className="absolute inset-0 opacity-50 contrast-125"
                            style={{
                                background: `radial-gradient(circle at 30% 30%, ${data.soul_color}, transparent 60%),
                                      radial-gradient(circle at 70% 70%, #000, transparent)`
                            }}
                        />
                    )}

                    {/* Shine */}
                    {!isLegendary && <div className="absolute top-4 left-4 w-10 h-10 bg-white/10 blur-xl rounded-full" />}

                    <div className="text-white/20 text-4xl relative z-10 mix-blend-overlay">💎</div>
                </div>
            </div>

            {/* Footer / Core Tension */}
            <div className="w-full bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/5 flex items-center justify-between gap-4">
                <div className="text-left flex-1">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Core Tension</p>
                    <p className="text-sm font-bold text-white tracking-wide">
                        {typeof data.core_tension === 'object' ? data.core_tension.conflict : (data.core_tension || "Unresolved")}
                    </p>
                </div>
                <div className="p-1 bg-white rounded-sm shrink-0">
                    <QRCodeSVG value={shareUrl} size={48} />
                </div>
            </div>

            {/* ID Stamp */}
            <p className="absolute bottom-2 text-[8px] text-zinc-700 font-mono">
                HASH: {soulId.slice(0, 12)}...
            </p>
        </div >
    );
}
