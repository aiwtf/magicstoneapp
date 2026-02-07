import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoulSignal, scanNearbySignals, compressSoulVector } from '../utils/signalRelay';
import { calculateBearing, calculateDistance, getCurrentLocation, GeoLocation } from '../utils/geoEngine';
import { SoulComposite } from '../utils/soulAggregator';
import { Sparkles, Navigation, RefreshCw } from 'lucide-react';

interface SoulCompassProps {
    userSoul: SoulComposite;
    onClose: () => void;
}

interface Blip {
    id: string;
    bearing: number; // 0-360
    distance: number; // meters
    similarity: number; // 0-1
    isGold: boolean;
}

export default function SoulCompass({ userSoul, onClose }: SoulCompassProps) {
    const [scanning, setScanning] = useState(true);
    const [blips, setBlips] = useState<Blip[]>([]);
    const [myLoc, setMyLoc] = useState<GeoLocation | null>(null);
    const [statusMsg, setStatusMsg] = useState("Aligning Soul Compass...");
    const [selectedBlip, setSelectedBlip] = useState<Blip | null>(null);

    // Compress my soul once
    const myVector = useRef(compressSoulVector(userSoul)).current;

    // 1. Initialize & Scan
    useEffect(() => {
        let mounted = true;

        const startScan = async () => {
            try {
                // A. Get My Location
                setStatusMsg("Triangulating Position...");
                const { location, geohash } = await getCurrentLocation();
                if (!mounted) return;
                setMyLoc(location);

                // B. Scan Network
                setStatusMsg("Scanning Ethereal Plane...");
                const signals = await scanNearbySignals(geohash);
                if (!mounted) return;

                // C. Process Signals
                const processed = signals
                    .filter(s => s.id !== userSoul.fragments[0]?.id) // Exclude self (heuristic)
                    .map(signal => {
                        // 1. Calculate Similarity (Cosine or simple Euclidean diff inverted)
                        // Simple 1 - AvgDiff approach
                        const diff = signal.soul_vector.reduce((acc, val, i) => {
                            return acc + Math.abs(val - (myVector[i] || 0));
                        }, 0);
                        // Max possible diff approx: 6 dimensions * 100 = 600. 
                        // Actually vectors are [0-100]. 
                        // Let's normalize. 6 dims. Max raw diff 600.
                        const similarity = Math.max(0, 1 - (diff / 300)); // 300 as soft cap for "very different"

                        // 2. Decode position (Approximate from Geohash center for now, OR if we stored lat/lon... 
                        // WAIT. We DO NOT store lat/lon. 
                        // We only have the Geohash of the room.
                        // Implication: Everyone in the same Geohash is "in the room".
                        // Logic Update: We cannot get exact bearing without lat/lon.
                        // Compromise: We randomize the angle for "Privacy Theater" OR use hash of ID for stable random plotting.
                        // "Blind Box" means we don't know WHERE they are, just that they are CLOSE.
                        // So we project them onto the radar at random/hashed angles to visualize "presence".

                        // Deterministic Pseudo-Random based on ID to keep blip stable
                        const pseudoAngle = parseInt(signal.id.slice(0, 4), 16) % 360;
                        const pseudoDist = (parseInt(signal.id.slice(4, 8), 16) % 800) + 100; // 100m - 900m virtual display

                        return {
                            id: signal.id,
                            bearing: pseudoAngle,
                            distance: pseudoDist,
                            similarity: similarity,
                            isGold: similarity > 0.9
                        };
                    })
                    .filter(b => b.similarity > 0.6); // Ghost Filter

                setBlips(processed);
                setStatusMsg(`${processed.length} Souls Resonating`);
                setScanning(false);

            } catch (e) {
                console.error(e);
                setStatusMsg("Connection Severed.");
                setScanning(false);
            }
        };

        startScan();

        return () => { mounted = false; };
    }, [userSoul]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
            {/* Close */}
            <button
                onClick={onClose}
                className="absolute top-8 right-8 text-zinc-500 hover:text-white"
            >
                CLOSE
            </button>

            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">

                {/* Status */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 text-center w-full">
                    <p className="text-purple-300 text-xs tracking-[0.2em] animate-pulse">
                        {statusMsg}
                    </p>
                </div>

                {/* Radar Grid */}
                <div className="absolute inset-0 rounded-full border border-zinc-800 bg-zinc-900/50" />
                <div className="absolute inset-[25%] rounded-full border border-zinc-800/50" />
                <div className="absolute inset-[50%] rounded-full border border-zinc-800/30" />

                {/* Scanning line */}
                {scanning && (
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div className="w-1/2 h-full bg-gradient-to-r from-transparent to-purple-500/20 origin-right animate-[spin_2s_linear_infinite]" />
                    </div>
                )}

                {/* Center: Me */}
                <div className="relative z-10 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white]" />

                {/* Blips */}
                {blips.map(blip => (
                    <motion.div
                        key={blip.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute w-12 h-12 flex items-center justify-center cursor-pointer group"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: `translate(-50%, -50%) rotate(${blip.bearing}deg) translateY(-${Math.min(140, blip.distance / 5)}px) rotate(-${blip.bearing}deg)`
                        }}
                        onClick={() => setSelectedBlip(blip)}
                    >
                        {/* The Dot */}
                        <div className={`w-3 h-3 rounded-full transition-all duration-500 ${blip.isGold
                                ? 'bg-yellow-400 shadow-[0_0_15px_gold]'
                                : 'bg-purple-500/50 shadow-[0_0_10px_purple] group-hover:bg-purple-400'
                            }`} />

                        {/* Ripple Effect for Gold */}
                        {blip.isGold && (
                            <div className="absolute inset-0 rounded-full border border-yellow-500/30 animate-ping" />
                        )}
                    </motion.div>
                ))}

            </div>

            {/* Selected Info */}
            <AnimatePresence>
                {selectedBlip && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="absolute bottom-12 left-8 right-8 p-6 bg-zinc-900/90 border border-zinc-700 rounded-2xl backdrop-blur-md"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className={`text-lg font-bold ${selectedBlip.isGold ? 'text-yellow-400' : 'text-purple-300'}`}>
                                    {selectedBlip.isGold ? 'Golden Resonance' : 'Wandering Soul'}
                                </h3>
                                <p className="text-zinc-500 text-xs mt-1">
                                    Match: {Math.round(selectedBlip.similarity * 100)}%
                                </p>
                            </div>
                            <button onClick={() => setSelectedBlip(null)} className="text-zinc-500">x</button>
                        </div>
                        <div className="mt-4 flex gap-4 text-xs text-zinc-400 font-mono">
                            <span>ID: {selectedBlip.id.slice(0, 6)}...</span>
                            <span>~{selectedBlip.distance}m Away</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
