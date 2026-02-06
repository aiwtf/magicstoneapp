'use client';

import MagicStone from "./components/MagicStone";
import SoulInput from "./components/SoulInput";
import SoulReadingModal from "./components/SoulReadingModal";
import { useSoulEngine } from "./hooks/useSoulEngine";
import { Download, Info, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const { progress, logs, isAbsorbing, absorbSoul } = useSoulEngine();
  const [reading, setReading] = useState(null);
  const [isAwakening, setIsAwakening] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleAwaken = async () => {
    if (processing) return;
    setIsAwakening(true); #ekko

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs })
      });

      if (!res.ok) throw new Error('Failed to awaken');

      const data = await res.json();
      setReading(data);
      setShowModal(true);
    } catch (e) {
      console.error(e);
      alert("The connection is weak. Ensure GEMINI_API_KEY is set.");
    } finally {
      setIsAwakening(false);
    }
  };

  // Prevent multiple clicks
  const processing = isAbsorbing || isAwakening;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-black selection:bg-purple-900 selection:text-white">

      {/* Soul Reading Modal */}
      <AnimatePresence>
        {showModal && <SoulReadingModal isOpen={showModal} onClose={() => setShowModal(false)} data={reading} />}
      </AnimatePresence>

      {/* Background Ambience - dynamic based on progress */}
      <div className="fixed inset-0 pointer-events-none transition-all duration-[3000ms]">
        <div
          className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(88,28,135,0.15),transparent_70%)] transition-opacity duration-1000"
          style={{ opacity: 0.15 + (progress / 200) }}
        ></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(34,211,238,0.1),transparent_60%)]"></div>
      </div>

      <div className="z-10 flex flex-col items-center text-center px-6 max-w-xl mx-auto space-y-8 w-full">

        {/* Title Section */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 drop-shadow-2xl">
            MAGIC STONE
          </h1>
          <p className="text-gray-400 text-sm md:text-base tracking-widest uppercase">
            Start your soulmate journey
          </p>
        </div>

        {/* The Magic Stone Component */}
        <div className="py-4">
          <MagicStone isAbsorbing={isAbsorbing} progress={progress} />
        </div>

        {/* Input Area */}
        <SoulInput onSend={absorbSoul} isLoading={processing} />

        {/* Actions Zone: Status or Awakening */}
        <div className="min-h-[40px] flex items-center justify-center">
          {progress > 10 ? (
            <button
              onClick={handleAwaken}
              disabled={processing}
              className="group flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 hover:bg-magic-purple/20 border border-magic-purple/50 text-magic-purple hover:text-white transition-all duration-500 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isAwakening ? "animate-spin" : ""}`} />
              <span className="text-xs font-bold tracking-widest uppercase">
                {isAwakening ? "Reading Soul..." : "Awaken Stone"}
              </span>
            </button>
          ) : (
            <p className="h-4 text-[10px] text-gray-700 font-mono tracking-tighter">
              {progress > 0 ? `SYNC: ${progress.toFixed(0)}%` : ""}
            </p>
          )}
        </div>

        {/* Download Buttons - Moved to bottom, smaller */}
        <div className="flex gap-4 opacity-50 hover:opacity-100 transition-opacity duration-500 mt-8 scale-90">
          {/* Simpler placeholder buttons for now to keep focus on the interaction */}
          <div className="text-[10px] text-gray-600 uppercase tracking-widest">
            Available on iOS & Android
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-6 text-[10px] text-gray-600 tracking-wider">
          © {new Date().getFullYear()} Magic Stone App. All souls reserved.
        </footer>
      </div>
    </main>
  );
}
