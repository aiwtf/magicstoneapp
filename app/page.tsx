'use client';

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import SoulInput from "./components/SoulInput";
import MagicStone from "./components/MagicStone";
// import IncantationModal from "./components/IncantationModal"; // Legacy
import RitualAltar from "./components/RitualAltar"; // New
import SoulRadar from "./components/SoulRadar";
import SoulStatus from "./components/SoulStatus";
import SoulReadingModal from "./components/SoulReadingModal";
import MintingModal from "./components/MintingModal"; // New
import SoulCompass from "./components/SoulCompass"; // New
import SoulResultDisplay from "./components/SoulResultDisplay"; // New Visual System
import InstallPrompt from "./components/InstallPrompt"; // Progressive Disclosure
import { broadcastSignal, compressSoulVector } from "./utils/signalRelay"; // New
import { useSoulEngine } from "./hooks/useSoulEngine";
import { Sparkles, RefreshCw, Radio, Gem, Compass } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useLanguage } from "./contexts/LanguageContext";
import LanguageSelector from "./components/LanguageSelector";

export default function Home() {
  const { t } = useLanguage();
  const { progress, isAbsorbing, absorbSoul, injectFragment, soulData } = useSoulEngine();

  // Stable random selection on mount (1-12)
  const [stoneIndex] = useState(() => Math.floor(Math.random() * 12) + 1);

  // soulData is now the composite directly from the hook
  const isInitialized = !!soulData;
  const canMint = (soulData?.density || 0) >= 0.8;

  const [showAltar, setShowAltar] = useState(false); // Renamed from showIncantation
  const [showRadar, setShowRadar] = useState(false);
  const [showReading, setShowReading] = useState(false);
  const [showMinting, setShowMinting] = useState(false);
  const [showCompass, setShowCompass] = useState(false); // New

  const handleOpenCompass = async () => {
    if (!soulData) return;
    setShowCompass(true);
    try {
      // Dynamic geo import
      const { getCurrentLocation } = await import("./utils/geoEngine");
      const { geohash } = await getCurrentLocation();

      await broadcastSignal({
        // id is now auto-managed (stable)
        geohash: geohash,
        soul_vector: compressSoulVector(soulData),
        timestamp: Date.now()
      });
    } catch (e) {
      console.error("Compass Broadcast Error", e);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black selection:bg-purple-900/30 relative overflow-hidden">

      {/* Hero Video Background - Only active on Landing, unmounts during Ritual/Result */}
      {(!isInitialized && !showAltar) && (
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src="/hero_v3.mp4"
          poster="/black.png"
          autoPlay
          loop
          muted
          playsInline
        />
      )}

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      <LanguageSelector />

      {/* Background Ambience (on top of video) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none z-[2]" />

      {/* Trust & Auth Indicator (Progressive Disclosure) */}
      <SoulStatus visible={isInitialized} />

      {/* PWA Install Prompt (Triggered after Soul Injection) */}
      <InstallPrompt trigger={isInitialized} />

      {/* Title */}
      <h1 className="z-10 text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-purple-400/50 mb-2 tracking-tighter opacity-80">
        {t('app.title')}
      </h1>
      <p className="z-10 text-[9px] text-zinc-600 mb-8 uppercase tracking-[0.3em]">
        v0.9.6 (English Default)
      </p>

      {/* Main Interaction Area */}
      <div className="z-10 w-full max-w-4xl px-4 flex flex-col items-center gap-8">

        {/* Onboarding / Stone View */}
        {!isInitialized ? (
          <div className="text-center space-y-6 max-w-md">
            <p className="text-zinc-500 text-sm font-light tracking-widest uppercase">
              {t('app.subtitle')}
            </p>
            <button
              onClick={() => setShowAltar(true)}
              className="group relative px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden hover:border-purple-500/50 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col items-center gap-1 z-10">
                <div className="flex items-center gap-2 text-zinc-300 font-light tracking-[0.2em] group-hover:text-purple-300 transition-colors uppercase text-xs">
                  <Sparkles className="w-4 h-4" />
                  {t('btn.begin')}
                </div>
              </div>
            </button>

            {/* TEMP GEO TEST (For Onboarding Users) */}
            <button
              onClick={async () => {
                try {
                  const { getCurrentLocation } = await import("./utils/geoEngine");
                  const result = await getCurrentLocation();
                  alert(`📍 成功獲取 Geohash: ${result.geohash}\n(精度 Level 5 ≈ 5km 盲盒範圍)\n經緯度 (隱藏): ${result.location.lat.toFixed(2)}, ${result.location.lon.toFixed(2)}`);
                } catch (e: any) {
                  alert("❌ 定位錯誤 (是否已允許權限?): " + (e.message || "Unknown error"));
                }
              }}
              className="block mx-auto mt-8 text-[10px] text-zinc-800 hover:text-zinc-600 cursor-pointer transition-colors"
            >
              [測試] 點擊測試 Geohash 連線
            </button>
          </div>
        ) : (
          <>
            <div className="w-full animate-in fade-in zoom-in duration-1000">
              <SoulResultDisplay data={soulData!} stoneIndex={stoneIndex} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 flex-wrap justify-center">
              {/* Reset Button */}
              <button
                onClick={() => {
                  localStorage.removeItem('magic_stone_composite');
                  window.location.reload();
                }}
                className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-full hover:bg-zinc-800 hover:text-red-400 transition-all text-zinc-500"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Radar Button */}
              <button
                onClick={() => setShowRadar(true)}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-purple-900/30 rounded-full hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all group"
              >
                <Radio className="w-4 h-4 text-purple-400 group-hover:animate-pulse" />
                <span className="text-xs font-medium text-zinc-300 tracking-wider uppercase group-hover:text-purple-300">
                  {t('btn.radar')}
                </span>
              </button>

              {/* Compass Button (New) */}
              <button
                onClick={handleOpenCompass}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-blue-900/30 rounded-full hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all group"
              >
                <Compass className="w-4 h-4 text-blue-400 group-hover:rotate-45 transition-transform duration-500" />
                <span className="text-xs font-medium text-zinc-300 tracking-wider uppercase group-hover:text-blue-300">
                  Broadcast
                </span>
              </button>

              {/* Inject More (Loop) */}
              <button
                onClick={() => setShowAltar(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900/50 text-zinc-400 hover:text-purple-400 hover:bg-purple-900/10 transition-all border border-zinc-800 hover:border-purple-800/50"
                title="Inject Soul Fragment"
              >
                <Sparkles className="w-4 h-4" />
              </button>

              {/* Mint Button (New) */}
              <button
                onClick={() => setShowMinting(true)}
                disabled={!canMint}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all group ${canMint
                  ? 'bg-zinc-900 border-emerald-900/30 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer'
                  : 'bg-zinc-950 border-zinc-900 opacity-50 cursor-not-allowed'
                  }`}
              >
                <Gem className={`w-4 h-4 ${canMint ? 'text-emerald-400' : 'text-zinc-700'}`} />
                <span className={`text-xs font-medium tracking-wider uppercase ${canMint ? 'text-zinc-300 group-hover:text-emerald-300' : 'text-zinc-700'}`}>
                  Mint Artifact
                </span>
              </button>
            </div>

            {/* Chat Input (Unlockable feature) */}
            <div className="w-full mt-4">
              <SoulInput onSend={absorbSoul} isLoading={isAbsorbing} />

              {/* TEMP GEO TEST (Hidden in Production generally, but useful for QA) */}
              <button
                onClick={async () => {
                  try {
                    const { getCurrentLocation } = await import("./utils/geoEngine");
                    const result = await getCurrentLocation();
                    alert(`📍 成功獲取 Geohash: ${result.geohash}\n(精度 Level 5 ≈ 5km 盲盒範圍)\n經緯度 (隱藏): ${result.location.lat.toFixed(2)}, ${result.location.lon.toFixed(2)}`);
                  } catch (e: any) {
                    alert("❌ 定位錯誤 (是否已允許權限?): " + (e.message || "Unknown error"));
                  }
                }}
                className="mt-4 w-full text-center text-[10px] text-zinc-800 hover:text-zinc-600 cursor-pointer transition-colors"
              >
                [測試] 點擊測試 Geohash 連線
              </button>
            </div>
          </>
        )}

      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAltar && (
          <RitualAltar
            onClose={() => setShowAltar(false)}
            onInitialize={(fragment) => {
              injectFragment(fragment); // Use new injector
              setShowAltar(false);
            }}
          />
        )}
      </AnimatePresence>

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
      {
        showRadar && soulData && (
          <SoulRadar
            userSoul={soulData}
            onClose={() => setShowRadar(false)}
          />
        )
      }

      {/* Soul Compass */}
      <AnimatePresence>
        {showCompass && soulData && (
          <SoulCompass
            userSoul={soulData}
            onClose={() => setShowCompass(false)}
          />
        )}
      </AnimatePresence>

      {/* Minting Modal */}
      <AnimatePresence>
        {showMinting && soulData && (
          <MintingModal
            isOpen={showMinting}
            onClose={() => setShowMinting(false)}
            data={soulData}
          />
        )}
      </AnimatePresence>

    </main >
  );
}
