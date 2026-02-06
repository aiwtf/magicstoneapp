'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Download } from 'lucide-react';
import ArtifactCard from './ArtifactCard';
import { SoulComposite } from '../utils/soulAggregator';

interface MintingModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: SoulComposite;
}

export default function MintingModal({ isOpen, onClose, data }: MintingModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative flex flex-col items-center gap-8"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 text-zinc-500 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* The Card */}
                <div className="relative group">
                    {/* Glow Effect behind card */}
                    <div className="absolute -inset-4 bg-gradient-to-b from-purple-500/20 to-cyan-500/20 rounded-xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <ArtifactCard data={data} />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors">
                        <Download className="w-4 h-4" />
                        Save Image
                    </button>
                    {/* Share Button (Mock) */}
                    <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-black border border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest text-xs hover:text-white hover:border-white/50 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        Share Link
                    </button>
                </div>

                <p className="text-zinc-600 text-[10px] uppercase tracking-widest max-w-xs text-center">
                    This artifact is permanently bound to your soul signature.
                </p>

            </motion.div>
        </div>
    );
}
