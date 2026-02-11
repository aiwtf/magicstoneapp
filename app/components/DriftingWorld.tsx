'use client';

/**
 * DriftingWorld.tsx - Phase 5: Geo-Spatial Soul Drifting World
 *
 * A fullscreen Mapbox GL map showing the user's neighborhood in dark 3D,
 * with glowing SoulMarker orbs floating at real GPS coordinates.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Compass, MapPin, Loader2 } from 'lucide-react';
import SoulMarker from './SoulMarker';
import { SoulComposite } from '../utils/soulAggregator';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

// Default fallback: mesmerizing global view
const DEFAULT_VIEW = {
    longitude: 121.5,
    latitude: 25.03,
    zoom: 2,
    pitch: 45,
    bearing: -17.6,
};

// Archetype-based color palette for ghost orbs
const GHOST_PALETTE = [
    { color: '#8B5CF6', archetype: 'The Dreamer' },
    { color: '#06B6D4', archetype: 'The Architect' },
    { color: '#F59E0B', archetype: 'The Wanderer' },
    { color: '#EF4444', archetype: 'The Alchemist' },
    { color: '#10B981', archetype: 'The Guardian' },
    { color: '#EC4899', archetype: 'The Oracle' },
    { color: '#3B82F6', archetype: 'The Rebel' },
    { color: '#F97316', archetype: 'The Healer' },
];

interface GhostSoul {
    id: string;
    longitude: number;
    latitude: number;
    color: string;
    archetype: string;
}

/**
 * Generate ghost souls within a ~1km radius of the user.
 * 1 degree latitude ≈ 111km, so 1km ≈ 0.009 degrees.
 */
function generateGhostSouls(
    centerLng: number,
    centerLat: number,
    count: number = 8
): GhostSoul[] {
    const RADIUS_DEG = 0.009; // ~1km
    return Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
        const r = RADIUS_DEG * (0.3 + Math.random() * 0.7);
        return {
            id: `ghost-${i}`,
            longitude: centerLng + r * Math.cos(angle),
            latitude: centerLat + r * Math.sin(angle),
            color: GHOST_PALETTE[i % GHOST_PALETTE.length].color,
            archetype: GHOST_PALETTE[i % GHOST_PALETTE.length].archetype,
        };
    });
}

interface DriftingWorldProps {
    isOpen: boolean;
    onClose: () => void;
    soulData?: SoulComposite | null;
}

export default function DriftingWorld({ isOpen, onClose, soulData }: DriftingWorldProps) {
    const userColor = soulData?.soul_color || '#8B5CF6';
    const archetypeName = soulData?.archetype_name || 'Unknown';

    const [userLocation, setUserLocation] = useState<{
        longitude: number;
        latitude: number;
    } | null>(null);
    const [geoError, setGeoError] = useState(false);
    const [isLocating, setIsLocating] = useState(true);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Request geolocation on mount
    useEffect(() => {
        if (!isOpen) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLocating(true);
        setGeoError(false);

        if (!navigator.geolocation) {
            setGeoError(true);
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({
                    longitude: pos.coords.longitude,
                    latitude: pos.coords.latitude,
                });
                setIsLocating(false);
            },
            () => {
                setGeoError(true);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [isOpen]);

    // Generate ghost souls around the user
    const ghostSouls = useMemo(() => {
        if (!userLocation) return [];
        return generateGhostSouls(userLocation.longitude, userLocation.latitude);
    }, [userLocation]);

    // View state for the map
    const initialViewState = useMemo(() => {
        if (userLocation) {
            return {
                longitude: userLocation.longitude,
                latitude: userLocation.latitude,
                zoom: 15,
                pitch: 60,
                bearing: -17.6,
            };
        }
        return DEFAULT_VIEW;
    }, [userLocation]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black"
            >
                {/* Loading state */}
                {(isLocating || !mapLoaded) && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-16 h-16 rounded-full border border-purple-500/30 flex items-center justify-center"
                        >
                            {isLocating ? (
                                <MapPin className="w-8 h-8 text-purple-400" />
                            ) : (
                                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                            )}
                        </motion.div>
                        <p className="mt-4 text-xs text-zinc-500 uppercase tracking-widest">
                            {isLocating ? 'Locating your coordinates...' : 'Rendering the Ether...'}
                        </p>
                    </div>
                )}

                {/* Mapbox Map */}
                {!isLocating && (
                    <Map
                        initialViewState={initialViewState}
                        mapboxAccessToken={MAPBOX_TOKEN}
                        mapStyle={MAP_STYLE}
                        style={{ width: '100%', height: '100%' }}
                        onLoad={() => setMapLoaded(true)}
                        maxPitch={85}
                        fog={{
                            color: 'rgb(10, 10, 20)',
                            'high-color': 'rgb(20, 10, 40)',
                            'horizon-blend': 0.1,
                            'space-color': 'rgb(5, 5, 15)',
                            'star-intensity': 0.6,
                        }}
                        terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
                    >
                        {/* Navigation Controls */}
                        <NavigationControl position="bottom-right" visualizePitch />
                        <GeolocateControl position="bottom-right" trackUserLocation />

                        {/* === User's Soul Marker === */}
                        {userLocation && (
                            <Marker
                                longitude={userLocation.longitude}
                                latitude={userLocation.latitude}
                                anchor="center"
                            >
                                <SoulMarker
                                    color={userColor}
                                    label={archetypeName}
                                    isUser={true}
                                    size={32}
                                />
                            </Marker>
                        )}

                        {/* === Ghost Soul Markers === */}
                        {ghostSouls.map((ghost) => (
                            <Marker
                                key={ghost.id}
                                longitude={ghost.longitude}
                                latitude={ghost.latitude}
                                anchor="center"
                            >
                                <SoulMarker
                                    color={ghost.color}
                                    label={ghost.archetype}
                                    size={16}
                                />
                            </Marker>
                        ))}
                    </Map>
                )}

                {/* HUD Overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="pointer-events-auto absolute top-6 right-6 p-2 rounded-full border border-white/10 bg-black/50 backdrop-blur-sm text-zinc-400 hover:text-white hover:border-white/30 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* User Identity Badge */}
                    <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-black/60 backdrop-blur-xl">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: userColor,
                                    boxShadow: `0 0 8px ${userColor}`,
                                }}
                            />
                            <span className="text-[11px] text-zinc-300 font-medium tracking-wide">
                                {archetypeName}
                            </span>
                            {userLocation && (
                                <span className="text-[9px] text-zinc-600 ml-1">
                                    {userLocation.latitude.toFixed(4)}°, {userLocation.longitude.toFixed(4)}°
                                </span>
                            )}
                        </div>
                        <span className="text-[9px] text-zinc-700 uppercase tracking-widest">
                            The Drifting World
                        </span>
                    </div>

                    {/* Ghost count / status indicator */}
                    <div className="pointer-events-none absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-black/60 backdrop-blur-xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-zinc-500 tracking-wider">
                            {ghostSouls.length} souls nearby
                        </span>
                    </div>

                    {/* Geo Error Banner */}
                    {geoError && (
                        <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-900/30 backdrop-blur-xl">
                            <span className="text-[10px] text-amber-300/80">
                                Location unavailable — showing global view
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
