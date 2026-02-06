'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';

interface SoulInputProps {
    onSend: (text: string) => void;
    isLoading?: boolean;
}

export default function SoulInput({ onSend, isLoading }: SoulInputProps) {
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = () => {
        if (!text.trim() || isLoading) return;
        onSend(text);
        setText('');
        setIsFocused(false);
    };

    return (
        <div className="w-full max-w-md mx-auto mt-8 relative">
            <AnimatePresence>
                {/* Input Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative rounded-2xl border transition-all duration-500 overflow-hidden
                ${isFocused
                            ? 'bg-black/80 border-magic-purple/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                >
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Whisper to the stone..."
                        disabled={isLoading}
                        rows={3}
                        className="w-full bg-transparent p-4 text-white placeholder-white/30 resize-none outline-none text-sm md:text-base scrollbar-hide"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />

                    {/* Send Button */}
                    <div className="absolute bottom-2 right-2">
                        <button
                            onClick={handleSubmit}
                            disabled={!text.trim() || isLoading}
                            className={`p-2 rounded-full transition-all duration-300 ${text.trim() && !isLoading
                                    ? 'bg-magic-purple text-white hover:bg-magic-cyan hover:scale-110 shadow-lg cursor-pointer'
                                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                                }`}
                        >
                            <Send size={16} className={isLoading ? 'animate-pulse' : ''} />
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Helper text */}
            <p className="text-center text-[10px] text-white/20 mt-2 uppercase tracking-widest">
                {isLoading ? "Absorbing Soul Data..." : "Press Enter to Transmit"}
            </p>
        </div>
    );
}
