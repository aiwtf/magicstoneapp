'use client';

import MagicStone from "./components/MagicStone";
import { Download, Info, Heart } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-black selection:bg-purple-900 selection:text-white">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(88,28,135,0.15),transparent_70%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(34,211,238,0.1),transparent_60%)]"></div>
      </div>

      <div className="z-10 flex flex-col items-center text-center px-6 max-w-xl mx-auto space-y-8">

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
        <div className="py-8">
          <MagicStone />
        </div>

        {/* Description */}
        <p className="text-white/60 leading-relaxed max-w-md mx-auto text-sm md:text-base border-l-2 border-purple-500/30 pl-4 py-1 text-left">
          The Magic Stone uses ancient algorithms and modern data to find the one soul capable of completing yours.
        </p>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
          <button className="flex-1 group relative flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl backdrop-blur-sm transition-all duration-300">
            <div className="w-8 h-8 flex items-center justify-center bg-black/50 rounded-lg group-hover:scale-110 transition-transform">
              {/* Apple Icon placeholder using Lucide */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.48C2.7 15.25 1.73 6.77 7.73 6.53c1.43.05 2.52.97 3.32.97.77 0 2.22-.92 3.75-.85 1.34.06 2.37.53 3.01 1.45-2.67 1.63-2.22 5.04.28 6.07-.46 1.37-1.07 2.76-2.05 3.9l.01.21zM12.03 4.54c-.58 1.48-1.95 2.4-3.5 2.27-.08-1.37.66-2.73 1.76-3.52 1.05-.8 2.51-1.09 3.1-.11.16.48.27.91.13 1.36h-1.49z" /></svg>
            </div>
            <div className="text-left">
              <span className="block text-[10px] uppercase tracking-wider text-gray-400">Download on the</span>
              <span className="block text-sm font-bold text-white group-hover:text-purple-300 transition-colors">App Store</span>
            </div>
          </button>

          <button className="flex-1 group relative flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl backdrop-blur-sm transition-all duration-300">
            <div className="w-8 h-8 flex items-center justify-center bg-black/50 rounded-lg group-hover:scale-110 transition-transform">
              {/* Play Store Icon placeholder */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M5 20.5v-17c0-.55.45-1 1-1 .18 0 .35.05.5.15l13.8 8.43c.47.28.62.9.33 1.37-.1.15-.22.28-.36.36L6.5 20.35c-.47.28-1.09.13-1.37-.34-.1-.13-.13-.3-.13-.48z" /></svg>
            </div>
            <div className="text-left">
              <span className="block text-[10px] uppercase tracking-wider text-gray-400">Get it on</span>
              <span className="block text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">Google Play</span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-6 text-[10px] text-gray-600 tracking-wider">
          © {new Date().getFullYear()} Magic Stone App. All souls reserved.
        </footer>
      </div>
    </main>
  );
}
