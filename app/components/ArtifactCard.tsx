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
            <div className="mt-4 space-y-1">
                <h3 className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase">Soulbound Artifact</h3>
                <h2 className="text-xl font-serif text-white tracking-wide">{data.archetype}</h2>
            </div>

            {/* Visual Center (Abstract Representation) */}
            <div className="flex-1 w-full flex items-center justify-center my-4">
                <div className="relative w-48 h-48 rounded-full flex items-center justify-center">
                    {/* Aura Halo - Pulsing */}
                    <div className="absolute inset-0 rounded-full blur-3xl opacity-40 animate-pulse" style={{ backgroundColor: data.soul_color }} />

                    {/* Core (Simulating the Stone 2D fallback) */}
                    <div
                        className="w-32 h-32 rounded-full shadow-inner border border-white/20 relative overflow-hidden transition-transform duration-700 group-hover:scale-105"
                        style={{
                            background: `radial-gradient(circle at 30% 30%, ${data.soul_color}, #000)`
                        }}
                    >
                        {/* Noise texture for detail */}
                        <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />

                        {/* Shine reflection */}
                        <div className="absolute top-4 left-4 w-10 h-10 bg-white/10 blur-xl rounded-full" />
                    </div>
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
        </div>
    );
}
