'use client';

import { useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import SoulInput from "./components/SoulInput";
import MagicStone from "./components/MagicStone";
import RitualAltar from "./components/RitualAltar";
import SoulRadar from "./components/SoulRadar";
import SoulStatus from "./components/SoulStatus";
import SoulReadingModal from "./components/SoulReadingModal";
import MintingModal from "./components/MintingModal";
import SoulCompass from "./components/SoulCompass";
import SoulResultDisplay from "./components/SoulResultDisplay";
import InstallPrompt from "./components/InstallPrompt";
import { broadcastSignal, compressSoulVector } from "./utils/signalRelay";
import { useSoulEngine } from "./hooks/useSoulEngine";
import { supabase } from "./utils/supabaseClient";
import { Sparkles, RefreshCw, Radio, Gem, Compass, Shield, Zap, Save, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "./contexts/LanguageContext";
import LanguageSelector from "./components/LanguageSelector";
import AuthModal from "./components/AuthModal";
import SoulInjector from "./components/SoulInjector";

export default function Home() {
  const { t } = useLanguage();
  const { progress, isAbsorbing, absorbSoul, injectFragment, soulData } = useSoulEngine();

  // Stable random selection on mount (1-12)
  const [stoneIndex] = useState(() => Math.floor(Math.random() * 12) + 1);

  // soulData is now the composite directly from the hook
  const isInitialized = !!soulData;
  const canMint = (soulData?.density || 0) >= 0.8;

  const [showAltar, setShowAltar] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [showReading, setShowReading] = useState(false);
  const [showMinting, setShowMinting] = useState(false);
  const [showCompass, setShowCompass] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showInjectModal, setShowInjectModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync level from soul data
  const syncLevel = soulData?.synchronization?.level ?? 1;

  // Show toast with auto-dismiss
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const [user, setUser] = useState<any>(null);
  const [pendingSave, setPendingSave] = useState(false);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Pending Save Effect
  useEffect(() => {
    if (user && pendingSave) {
      saveSoulToSupabase();
      setPendingSave(false);
    }
  }, [user, pendingSave]);

  // Save soul data to Supabase (Users Table)
  const saveSoulToSupabase = useCallback(async () => {
    if (!soulData) return;

    // Fallback if not logged in (should be handled by pendingSave but good for safety)
    if (!user) {
      localStorage.setItem('magic_stone_composite', JSON.stringify(soulData));
      showToast(t('toast.saved_local') || 'Progress saved locally', 'info');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          soul_data: soulData,
          soul_level: soulData.synchronization?.level || 1,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      showToast(t('toast.soul_archived') || 'Soul archived successfully', 'success');
    } catch (err: any) {
      console.error('Save error:', err);
      // Fallback
      localStorage.setItem('magic_stone_composite', JSON.stringify(soulData));
      showToast("Storage Error: " + err.message, 'error');
    }
  }, [soulData, user, showToast, t]);

  // Handle Seal Click
  const handleSealClick = () => {
    if (!user) {
      setPendingSave(true);
      setShowAuthModal(true);
    } else {
      saveSoulToSupabase();
    }
  };

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

      {/* Trust & Auth Indicator — HIDDEN (Progressive Disclosure: auth via Seal button only) */}
      {false && <SoulStatus visible={isInitialized} />}

      {/* PWA Install Prompt — HIDDEN (Will surface contextually in Phase 5) */}
      {false && <InstallPrompt trigger={isInitialized} />}

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

            {/* === SOUL ACTION GATE === */}
            <AnimatePresence mode="wait">
              {soulData && syncLevel < 3 ? (
                /* --- Scenario A: Level 1-2 (Incomplete Soul) --- */
                <motion.div
                  key="save-progress"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col items-center gap-4 mt-12"
                >
                  <p className="text-[11px] text-zinc-600 italic text-center max-w-sm leading-relaxed">
                    {t('gate.incomplete') || 'Your soul is not yet fully crystallized. Keep talking to your AI to reach Level 3.'}
                  </p>
                  <button
                    onClick={() => {
                      localStorage.setItem('magic_stone_composite', JSON.stringify(soulData));
                      showToast(t('toast.saved_local') || 'Progress saved locally', 'info');
                    }}
                    className="group flex items-center gap-2.5 px-7 py-3.5 bg-zinc-900/40 border border-zinc-700/50 rounded-full hover:border-amber-500/40 hover:bg-amber-900/10 transition-all duration-500 backdrop-blur-sm"
                  >
                    <Save className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-[0.15em] group-hover:text-amber-300 transition-colors">
                      {t('btn.save') || 'Save Progress'}
                    </span>
                  </button>
                </motion.div>
              ) : soulData && syncLevel >= 3 ? (
                /* --- Scenario B: Level 3 (Fully Crystallized) --- */
                <motion.div
                  key="soul-actions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex items-center justify-center gap-4 mt-12"
                >
                  {/* Left: Seal Soul — Primary / Triggers Auth + Save */}
                  <motion.button
                    onClick={handleSealClick}
                    animate={{ boxShadow: ['0 0 0px rgba(168,85,247,0)', '0 0 20px rgba(168,85,247,0.3)', '0 0 0px rgba(168,85,247,0)'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="group flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-purple-900/40 to-purple-800/20 border border-purple-500/30 rounded-full hover:border-purple-400/60 hover:from-purple-800/50 hover:to-purple-700/30 transition-all duration-500 backdrop-blur-sm"
                  >
                    <Shield className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    <span className="text-xs font-medium text-purple-200 uppercase tracking-[0.15em] group-hover:text-purple-100 transition-colors">
                      {t('btn.seal') || 'Seal Soul'}
                    </span>
                  </motion.button>

                  {/* Right: Inject Soul — Secondary / Placeholder */}
                  <motion.button
                    onClick={() => setShowInjectModal(true)}
                    animate={{ boxShadow: ['0 0 0px rgba(52,211,153,0)', '0 0 15px rgba(52,211,153,0.2)', '0 0 0px rgba(52,211,153,0)'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="group flex items-center gap-2.5 px-7 py-3.5 bg-transparent border border-zinc-700/50 rounded-full hover:border-emerald-500/40 hover:bg-emerald-900/10 transition-all duration-500"
                  >
                    <Zap className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em] group-hover:text-emerald-300 transition-colors">
                      {t('btn.inject') || 'Inject Soul'}
                    </span>
                  </motion.button>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Restart Button — Subordinate */}
            <div className="flex justify-center mt-6 mb-8">
              <button
                onClick={() => {
                  localStorage.removeItem('magic_stone_composite');
                  window.location.reload();
                }}
                className="group flex items-center gap-2 px-5 py-2 bg-zinc-900/30 border border-zinc-800/40 rounded-full hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-300"
                title="Restart Ritual"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-400 group-hover:rotate-180 transition-all duration-500" />
                <span className="text-[9px] text-zinc-700 uppercase tracking-widest group-hover:text-zinc-500 transition-colors">
                  {t('btn.reset') || 'Restart'}
                </span>
              </button>
            </div>

            {/* === PHASE 5 RESTORE POINT: Interactive Elements Hidden === */}
            {false && (
              <>
                {/* Radar Button */}
                <button onClick={() => setShowRadar(true)} className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-purple-900/30 rounded-full">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-zinc-300 tracking-wider uppercase">{t('btn.radar')}</span>
                </button>
                {/* Compass / Broadcast Button */}
                <button onClick={handleOpenCompass} className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-blue-900/30 rounded-full">
                  <Compass className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-zinc-300 tracking-wider uppercase">Broadcast</span>
                </button>
                {/* Inject More (Sparkles) */}
                <button onClick={() => setShowAltar(true)} className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900/50 text-zinc-400 border border-zinc-800">
                  <Sparkles className="w-4 h-4" />
                </button>
                {/* Mint Artifact */}
                <button onClick={() => setShowMinting(true)} disabled={!canMint} className="flex items-center gap-2 px-6 py-3 rounded-full border bg-zinc-900">
                  <Gem className="w-4 h-4" />
                  <span className="text-xs font-medium tracking-wider uppercase">Mint Artifact</span>
                </button>
                {/* Chat Input */}
                <div className="w-full mt-4">
                  <SoulInput onSend={absorbSoul} isLoading={isAbsorbing} />
                </div>
              </>
            )}
            {/* === END PHASE 5 RESTORE POINT === */}
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

      {/* Auth Modal — Triggered by Seal Soul button */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}

          />
        )}
      </AnimatePresence>

      {/* Inject Soul — Placeholder Modal */}
      <AnimatePresence>
        {showInjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <div className="absolute inset-0" onClick={() => setShowInjectModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-emerald-500/20 rounded-2xl p-8 shadow-2xl text-center space-y-4"
            >
              <button onClick={() => setShowInjectModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white z-10">
                <X className="w-5 h-5" />
              </button>

              <div className="text-4xl mb-2">🌊</div>
              <h3 className="text-lg font-serif text-white mb-6">
                {t('inject.title') || 'Drifting World Gateway'}
              </h3>

              <SoulInjector soulData={soulData ?? undefined} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full backdrop-blur-md border text-xs font-medium tracking-wider uppercase ${toast.type === 'success'
              ? 'bg-emerald-900/60 border-emerald-500/30 text-emerald-300'
              : toast.type === 'error'
                ? 'bg-red-900/60 border-red-500/30 text-red-300'
                : 'bg-zinc-800/60 border-zinc-600/30 text-zinc-300'
              }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

    </main >
  );
}
