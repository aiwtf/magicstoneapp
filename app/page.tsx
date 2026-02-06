'use client';

import MagicStone from "./components/MagicStone";
import SoulInput from "./components/SoulInput";
import SoulReadingModal from "./components/SoulReadingModal";
import IncantationModal from "./components/IncantationModal";
import { useSoulEngine } from "./hooks/useSoulEngine";
import { Download, Info, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { analyzeSoul } from "./actions";

export default function Home() {
  const { progress, logs, isAbsorbing, absorbSoul, initializeSoul } = useSoulEngine();
  const [reading, setReading] = useState<any>(null);
  const [isAwakening, setIsAwakening] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Check if soul is already awakened (initialized)
  // We can assume if progress is 100, we are awakened.
  // Or check if we have the specific initialization log.
  const isInitialized = progress >= 100;

  // Derive reading data from logs if available (persistence)
  // This is a quick hack to restore the reading if we just reloaded page after initialization
  if (!reading && isInitialized) {
    const initLog = logs.find(l => l.startsWith("SOUL_INIT_JSON::"));
    if (initLog) {
      try {
        const json = JSON.parse(initLog.replace("SOUL_INIT_JSON::", ""));
        setReading(json);
      } catch (e) { }
    }
  }

  const handleInitialization = (data: any) => {
    initializeSoul(data);
    setReading(data);
    // Optional: Show value or just transition UI
  };

  const handleOpenReading = () => {
    setShowModal(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-black selection:bg-purple-900 selection:text-white">

      {/* Soul Extraction Onboarding */}
      {!isInitialized && (
        <IncantationModal onInitialize={handleInitialization} />
      )}

      {/* Soul Reading Modal (Profile view) */}
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
            {isInitialized ? "Soul Connected" : "Waiting for Soul..."}
          </p>
        </div>

        {/* The Magic Stone Component */}
        <div className="py-4 cursor-pointer" onClick={() => isInitialized && setShowModal(true)}>
          <MagicStone isAbsorbing={isAbsorbing} progress={progress} soulData={reading} />
        </div>

        {/* Input Area (Only show if initialized, for "Chat to Grow" feature) */}
        {isInitialized && (
          <SoulInput onSend={absorbSoul} isLoading={false} />
        )}

        {/* Footer */}
        <footer className="absolute bottom-6 text-[10px] text-gray-600 tracking-wider">
          © {new Date().getFullYear()} Magic Stone App. All souls reserved.
        </footer>
      </div>
    </main>
  );
}
