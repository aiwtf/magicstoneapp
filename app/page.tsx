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
import { broadcastSignal, compressSoulVector } from "./utils/signalRelay"; // New
import { useSoulEngine } from "./hooks/useSoulEngine";
import { Sparkles, RefreshCw, Radio, Gem, Compass } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useLanguage } from "./contexts/LanguageContext";
import LanguageSelector from "./components/LanguageSelector";

export default function Home() {
  const { t } = useLanguage();
  const { progress, isAbsorbing, absorbSoul, injectFragment, soulData } = useSoulEngine();

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

      {/* Hero Video Background */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="/hero_v2.mp4"
        poster="/black.png"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      <LanguageSelector />

      {/* Background Ambience (on top of video) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none z-[2]" />

      {/* Trust & Auth Indicator */}
      <SoulStatus />

      {/* Title */}
      <h1 className="z-10 text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-purple-400/50 mb-2 tracking-tighter opacity-80">
        {t('app.title')}
      </h1>
      <p className="z-10 text-[9px] text-zinc-600 mb-8 uppercase tracking-[0.3em]">
        v0.9.1 (Geo-Beta)
      </p>

      {/* Main Interaction Area */}
      <div className="z-10 w-full max-w-md px-4 flex flex-col items-center gap-8">

        {/* Onboarding / Stone View */}
        {!isInitialized ? (
          <div className="text-center space-y-6">
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
                <span className="text-[10px] text-zinc-600 tracking-widest uppercase group-hover:text-purple-400/70 transition-colors">
                  {t('btn.begin_sub')}
                </span>
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
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-1000">
            {/* The Stone (Clickable) */}
            <div className="w-full h-[600px] relative">
              <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={1} color={soulData?.soul_color || '#ffffff'} />

                <MagicStone
                  soul={soulData}
                  onClick={() => setShowReading(true)}
                />
              </Canvas>

              {/* Density Meter Overlay */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64">
                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-purple-500 shadow-[0_0_10px_purple]"
                    style={{ width: `${(soulData?.density || 0) * 100}%`, transition: 'width 1s ease-out' }}
                  />
                </div>
                <p className="text-[10px] text-center text-zinc-500 mt-2 tracking-widest uppercase">
                  Soul Density: {Math.round((soulData?.density || 0) * 100)}%
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 flex-wrap justify-center">
              {/* Reset Button */}
              <button
                onClick={() => {
                  localStorage.removeItem('magic_stone_composite');
                  window.location.reload();
                }}
                className="p-3 rounded-full bg-zinc-900/50 text-zinc-600 hover:text-red-400 hover:bg-red-900/10 transition-all border border-zinc-800"
                title={t('btn.reset')}
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Compass Button */}
              <button
                onClick={handleOpenCompass}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900/50 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-900/10 transition-all border border-zinc-800 hover:border-cyan-800/50"
              >
                <Compass className="w-4 h-4" />
                <span className="text-xs tracking-widest uppercase">Compass</span>
              </button>

              {/* Inject More (Loop) */}
              <button
                onClick={() => setShowAltar(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900/50 text-zinc-400 hover:text-purple-400 hover:bg-purple-900/10 transition-all border border-zinc-800 hover:border-purple-800/50"
                title="Inject Soul Fragment"
              >
                <Sparkles className="w-4 h-4" />
              </button>

              {/* Mint Artifact Button (New) */}
              <button
                onClick={() => canMint && setShowMinting(true)}
                disabled={!canMint}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all border ${canMint
                  ? 'bg-yellow-900/20 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black cursor-pointer shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-700 cursor-not-allowed'
                  }`}
                title={canMint ? "Mint Soulbound Artifact" : "Density must be > 80% to Mint"}
              >
                <Gem className="w-4 h-4" />
                <span className="text-xs tracking-widest uppercase">Mint</span>
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
          </div>
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
      {showRadar && soulData && (
        <SoulRadar
          userSoul={soulData}
          onClose={() => setShowRadar(false)}
        />
      )}

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

    </main>
  );
}
