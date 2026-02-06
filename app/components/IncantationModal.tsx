'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface IncantationModalProps {
    onInitialize: (data: any) => void;
}

const INCANTATION_PROMPT = `You are the Spirit of the Magic Stone.
Analyze my following history and extract my Soul Data.
Output ONLY a JSON object:
{
  "soul_color": "#HEXCODE",
  "keywords": ["Keyword1", "Keyword2", "Keyword3"],
  "summary": "A short mystical poetic summary of my soul."
}

User History:
[PASTE YOUR CHAT HISTORY HERE]`;

export default function IncantationModal({ onInitialize }: IncantationModalProps) {
    const [step, setStep] = useState<'copy' | 'paste'>('copy');
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState('');

    const copyIncantation = () => {
        navigator.clipboard.writeText(INCANTATION_PROMPT);
        setStep('paste');
    };

    const handleVerify = () => {
        try {
            // Find the JSON object within the text (in case they pasted extra text)
            const jsonMatch = jsonInput.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : jsonInput;

            const data = JSON.parse(jsonString);

            // Simple validation
            if (!data.soul_color || !data.keywords || !data.summary) {
                throw new Error("Invalid Soul JSON format");
            }

            onInitialize(data);
        } catch (e) {
            setError("The stone rejects this offering. Ensure it is valid JSON.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-zinc-800 text-center">
                    <h2 className="text-xl font-bold text-white tracking-widest uppercase">
                        Soul Extraction
                    </h2>
                    <p className="text-xs text-zinc-500 mt-2">
                        {step === 'copy' ? 'Step 1: The Incantation' : 'Step 2: The Offering'}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <AnimatePresence mode="wait">
                        {step === 'copy' ? (
                            <motion.div
                                key="step-copy"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <p className="text-sm text-zinc-400 leading-relaxed text-center">
                                    To awaken the stone, you must first extract your soul data from the AI archives.
                                </p>

                                <div className="bg-black/50 p-4 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-500 relative group">
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Sparkles className="w-4 h-4 text-purple-500" />
                                    </div>
                                    {INCANTATION_PROMPT.substring(0, 150)}...
                                </div>

                                <button
                                    onClick={copyIncantation}
                                    className="w-full py-4 bg-white text-black font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy Incantation
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step-paste"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <p className="text-sm text-zinc-400 text-center">
                                    Paste the JSON artifact returned by the AI.
                                </p>

                                <textarea
                                    value={jsonInput}
                                    onChange={(e) => {
                                        setJsonInput(e.target.value);
                                        setError('');
                                    }}
                                    placeholder='{ "soul_color": "..." }'
                                    className="w-full h-32 bg-black/50 border border-zinc-700 rounded-lg p-3 text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500 resize-none"
                                />

                                {error && (
                                    <div className="flex items-center gap-2 text-red-400 text-xs justify-center">
                                        <AlertCircle className="w-3 h-3" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleVerify}
                                    className="w-full py-4 bg-purple-600 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-purple-500 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Awaken Stone
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
