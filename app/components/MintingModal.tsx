'use client';
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import ArtifactCard from './ArtifactCard';
import { SoulComposite } from '../utils/soulAggregator';

interface MintingModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: SoulComposite;
}

export default function MintingModal({ isOpen, onClose, data }: MintingModalProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    // Logic: Save Card as PNG
    const handleSaveImage = async () => {
        if (cardRef.current === null) return;
        setIsSaving(true);
        try {
            // Convert div to dataUrl
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });

            // Create a fake link to trigger download
            const link = document.createElement('a');
            link.download = `magicstone-${data.archetype_name || 'artifact'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to save image', err);
            alert('Could not save image. Please try screenshotting manually.');
        } finally {
            setIsSaving(false);
        }
    };

    // Logic: Native Share or Clipboard Copy
    const handleShare = async () => {
        const soulId = data.fragments && data.fragments[0] ? data.fragments[0].id : 'genesis';
        const shareUrl = `https://magicstone.app/soul/${soulId}`;
        const shareData = {
            title: 'My MagicStone Artifact',
            text: `I am the ${data.archetype_name}. Check out my Soulbound Artifact.`,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                // Use Mobile Native Share
                await navigator.share(shareData);
            } else {
                // Fallback to Clipboard
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing', err);
        }
    };

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
                <div className="relative group" ref={cardRef}>
                    {/* Glow Effect behind card */}
                    <div className="absolute -inset-4 bg-gradient-to-b from-purple-500/20 to-cyan-500/20 rounded-xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <ArtifactCard data={data} />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={handleSaveImage}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save Image'}
                    </button>

                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-black border border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest text-xs hover:text-white hover:border-white/50 transition-colors"
                    >
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
