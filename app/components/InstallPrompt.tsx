'use client';

import { useState, useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if running in standalone mode (already installed)
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
        setIsStandalone(isStandaloneMode);

        if (isStandaloneMode) return;

        // Detect Platform
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Android: Capture install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt after a short delay to not accept immediately on load
            setTimeout(() => setShowPrompt(true), 2000);
        };

        // iOS: Show prompt if not standalone
        if (isIosDevice && !isStandaloneMode) {
            // Check if we've shown it recently to avoid annoyance? 
            // For now, show it once per session or use localStorage logic later.
            // Let's just show it after a delay.
            setTimeout(() => setShowPrompt(true), 3000);
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    if (isStandalone || !showPrompt) return null;

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 md:pb-4 flex justify-center pointer-events-none"
                >
                    <div className="bg-zinc-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl max-w-sm w-full pointer-events-auto relative">
                        <button
                            onClick={() => setShowPrompt(false)}
                            className="absolute top-2 right-2 text-zinc-500 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-black rounded-xl overflow-hidden shrink-0 border border-white/10">
                                <img src="/android-chrome-192x192.png" alt="App Icon" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <h3 className="font-bold text-sm text-white">Install Magic Stone</h3>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Install our app for a better full-screen experience and stable soul connection.
                                </p>

                                {isIOS ? (
                                    <div className="text-xs text-zinc-300 flex flex-col gap-1 mt-2 bg-white/5 p-2 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span>1. Tap</span>
                                            <Share className="w-4 h-4 text-blue-400" />
                                            <span>Share</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>2. Select</span>
                                            <PlusSquare className="w-4 h-4 text-white" />
                                            <span>Add to Home Screen</span>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleInstallClick}
                                        className="mt-2 w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-xs font-bold text-white shadow-lg shadow-purple-900/30 active:scale-95 transition-transform"
                                    >
                                        Install Application
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
