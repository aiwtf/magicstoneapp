'use client';
import { QRCodeSVG } from 'qrcode.react';
import { SoulComposite } from '../utils/soulAggregator';

interface ArtifactCardProps {
    data: SoulComposite;
}

export default function ArtifactCard({ data }: ArtifactCardProps) {
    const rarity = data.density >= 0.95 ? 'LEGENDARY' : 'EPIC';
    // Use first fragment ID or random fallback if somehow empty
    const soulId = data.fragments && data.fragments[0] ? data.fragments[0].id : 'genesis';
    const shareUrl = `https://magicstone.app/soul/${soulId}`;

    return (
        <div className="relative w-80 h-[480px] bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col items-center p-6 text-center select-none group">
            {/* Decorative Border */}
            <div className="absolute inset-2 border border-white/10 rounded-lg pointer-events-none" />

            {/* Header */}
            <div className="mt-4 space-y-1 z-10 w-full px-6 text-center relative">
                <h3 className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase">Soulbound Artifact</h3>
                <h2 className="text-xl font-serif text-white tracking-wide">{data.archetype_name || (data as any).archetype}</h2>

                {/* Badges (MBTI / Enneagram) */}
                <div className="flex justify-center gap-2 mt-1">
                    {data.mbti_type && (
                        <span className="text-[9px] font-mono border border-zinc-700 bg-zinc-900/50 px-1.5 py-0.5 rounded text-cyan-400">
                            {data.mbti_type}
                        </span>
                    )}
                    {data.enneagram_type && (
                        <span className="text-[9px] font-mono border border-zinc-700 bg-zinc-900/50 px-1.5 py-0.5 rounded text-purple-400">
                            {data.enneagram_type}
                        </span>
                    )}
                </div>
            </div>

            {/* Visual Core */}
            <div className="relative w-64 h-64 my-4 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-4 border-double border-white/10 flex items-center justify-center bg-black/50 overflow-hidden relative">
                    {/* Abstract visual representation based on color */}
                    <div className="absolute inset-0 opacity-50 contrast-125"
                        style={{
                            background: `radial-gradient(circle at 30% 30%, ${data.soul_color}, transparent 60%),
                                  radial-gradient(circle at 70% 70%, #000, transparent)`
                        }}
                    />
                    {/* Shine */}
                    <div className="absolute top-4 left-4 w-10 h-10 bg-white/10 blur-xl rounded-full" />
                    <div className="text-white/20 text-4xl relative z-10">💎</div>
                </div>
            </div>

            {/* Footer / QR */}
            <div className="w-full bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/5 flex items-center justify-between gap-4">
                <div className="text-left">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Rarity</p>
                    <p className="text-sm font-bold text-yellow-500 tracking-widest">{rarity}</p>
                </div>
                <div className="p-1 bg-white rounded-sm">
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
