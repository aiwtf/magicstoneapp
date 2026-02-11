'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, LogIn, User } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';

interface SoulStatusProps {
    visible?: boolean;
}

export default function SoulStatus({ visible = true }: SoulStatusProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [status, setStatus] = useState<'loading' | 'anon' | 'authenticated'>('loading');

    useEffect(() => {
        // Check initial session
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session?.user) {
                setUser(data.session.user);
                setStatus('authenticated');
            } else {
                setStatus('anon');
            }
        };
        checkSession();

        // Listen for changes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            if (session?.user) {
                setUser(session.user);
                setStatus('authenticated');
            } else {
                setUser(null);
                setStatus('anon');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    if (status === 'loading') return null;

    // Progressive Disclosure Logic:
    // If authenticated, ALWAYS show (user has account).
    // If anon, ONLY show if visible is true (user has injected soul).
    if (status === 'anon' && !visible) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-4 left-4 z-40"
            >
                {status === 'anon' ? (
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full backdrop-blur-md group hover:bg-yellow-500/20 transition-all"
                    >
                        <ShieldAlert className="w-3 h-3 text-yellow-500 animate-pulse" />
                        <span className="text-[10px] font-medium text-yellow-200 uppercase tracking-wider group-hover:text-yellow-100">
                            Soul Unbound
                        </span>
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full backdrop-blur-md"
                        >
                            <Shield className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] font-medium text-emerald-200 uppercase tracking-wider">
                                Soul Bound
                            </span>
                        </button>
                        {/* 
                            Optional: User Profile / Logout 
                            For now, kept simple. User requested "Soul Bound" indicator.
                            Maybe a small avatar or logout on click?
                        */}
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {showAuthModal && (
                    <AuthModal onClose={() => setShowAuthModal(false)} />
                )}
            </AnimatePresence>
        </>
    );
}
