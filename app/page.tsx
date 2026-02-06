'use client';

import { useState, useEffect } from "react";
import SoulInput from "./components/SoulInput";
import MagicStone from "./components/MagicStone";
import IncantationModal from "./components/IncantationModal";
import SoulRadar from "./components/SoulRadar";
import SoulReadingModal from "./components/SoulReadingModal";
import { useSoulEngine } from "./hooks/useSoulEngine";
import { Sparkles, RefreshCw, Radio } from "lucide-react";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const { progress, logs, isAbsorbing, absorbSoul, initializeSoul } = useSoulEngine();

  // Reconstruct soul data from logs if available
  const soulLog = logs.find(l => l.startsWith("SOUL_INIT_JSON::"));
  const soulData = soulLog ? JSON.parse(soulLog.replace("SOUL_INIT_JSON::", "")) : null;
  const isInitialized = !!soulData;

  const [showIncantation, setShowIncantation] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [showReading, setShowReading] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black selection:bg-purple-900/30 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />

      {/* Title */}
      <h1 className="z-10 text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-purple-400/50 mb-8 tracking-tighter opacity-80">
        MAGIC STONE
      </h1>

      {/* Main Interaction Area */}
      <div className="z-10 w-full max-w-md px-4 flex flex-col items-center gap-8">

        {/* Onboarding / Stone View */}
        {!isInitialized ? (
          <div className="text-center space-y-6">
            <p className="text-zinc-500 text-sm font-light tracking-widest uppercase">
              A vessel awaits your essence
            </p>
            <button
              onClick={() => setShowIncantation(true)}
              className="group relative px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden hover:border-purple-500/50 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative text-zinc-300 font-light tracking-[0.2em] group-hover:text-purple-300 transition-colors uppercase text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Begin Resonance
              </span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-1000">
            {/* The Stone (Clickable) */}
            <div onClick={() => setShowReading(true)} className="cursor-pointer">
              <MagicStone
                progress={progress}
                isAbsorbing={isAbsorbing}
                soulData={soulData}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              {/* Reset Button */}
              <button
                onClick={() => {
                  localStorage.removeItem('magic_stone_logs');
                  window.location.reload();
                }}
                className="p-3 rounded-full bg-zinc-900/50 text-zinc-600 hover:text-red-400 hover:bg-red-900/10 transition-all border border-zinc-800"
                title="Shatter Stone (Reset)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Radar Button */}
              <button
                onClick={() => setShowRadar(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900/50 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-900/10 transition-all border border-zinc-800 hover:border-cyan-800/50"
              >
                <Radio className="w-4 h-4" />
                <span className="text-xs tracking-widest uppercase">Soul Radar</span>
              </button>
            </div>

            {/* Chat Input (Unlockable feature) */}
            <div className="w-full mt-4">
              <SoulInput onSend={absorbSoul} isLoading={isAbsorbing} />
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      {showIncantation && (
        <IncantationModal
          onInitialize={(data) => {
            initializeSoul(data);
            setShowIncantation(false);
          }}
        />
      )}

      {/* Profile Reading Modal */}
      <AnimatePresence>
        {showReading && soulData && (
          <SoulReadingModal
            isOpen={showReading}
            onClose={() => setShowReading(false)}
            data={soulData}
          />
        )}
      </AnimatePresence>

      {/* Soul Radar Overlay */}
      {showRadar && soulData && (
        <SoulRadar
          userSoul={soulData}
          onClose={() => setShowRadar(false)}
        />
      )}

    </main>
  );
}
