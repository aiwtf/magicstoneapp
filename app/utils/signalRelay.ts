import { supabase } from './supabaseClient';

export interface SoulSignal {
    id: string;          // Random ephemeral ID (UUID v4)
    geohash: string;     // The "Room" ID
    soul_vector: number[]; // Compressed stats
    timestamp: number;   // Unix timestamp
}

// TTL: 1 Hour in milliseconds
// TTL: 7 Days in milliseconds (Lazy Beacon)
const SIGNAL_TTL = 7 * 24 * 60 * 60 * 1000;

export interface SoulSignal {
    id: string;          // Stable ID (persisted in localStorage)
    geohash: string;     // The "Room" ID
    soul_vector: number[]; // Compressed stats
    timestamp: number;   // Unix timestamp
    fcm_token?: string;  // Optional Push Token
}

/**
 * Retrieves or generates a persistent Signal ID for this device.
 */
function getStableID(): string {
    if (typeof window === 'undefined') return crypto.randomUUID(); // Fallback for SSR
    let id = localStorage.getItem('soul_signal_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('soul_signal_id', id);
    }
    return id;
}

/**
 * Broadcasts (Upserts) the user's signal to the Blind Relay.
 * This effectively "checks in" to the location.
 * @param signal The Signal payload (excluding ID, which is auto-managed)
 */
export async function broadcastSignal(signal: Omit<SoulSignal, 'id'>): Promise<void> {
    const stableId = getStableID();

    const { error } = await supabase
        .from('soul_signals')
        .upsert([
            {
                id: stableId, // Use Persistent ID
                geohash: signal.geohash,
                soul_vector: signal.soul_vector, // Stored as JSONB
                timestamp: signal.timestamp,
                fcm_token: signal.fcm_token || null
            }
        ], { onConflict: 'id' });

    if (error) {
        console.error("Signal Broadcast Error:", error);
        throw new Error("Failed to broadcast signal.");
    }
}

/**
 * Scans for nearby persistent signals.
 * Filters out signals older than 7 days.
 * @param myGeohash The user's current geohash
 * @returns List of active/dormant SoulSignal objects
 */
export async function scanNearbySignals(myGeohash: string): Promise<SoulSignal[]> {
    const ttlCutoff = Date.now() - SIGNAL_TTL;

    const { data, error } = await supabase
        .from('soul_signals')
        .select('*')
        .eq('geohash', myGeohash)
        .gt('timestamp', ttlCutoff); // 7-Day Logic

    if (error) {
        console.error("Signal Scan Error:", error);
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((row: any) => ({
        id: row.id,
        geohash: row.geohash,
        soul_vector: row.soul_vector,
        timestamp: parseInt(row.timestamp),
        fcm_token: row.fcm_token
    }));
}

/**
 * Helper: Compresses a SoulComposite into a 6-dimensional vector.
 * [Structure, Luminosity, Resonance, Entropy, Cognitive, Density]
 */
import { SoulComposite } from './soulAggregator';

export function compressSoulVector(soul: SoulComposite): number[] {
    const d = soul.dimensions;
    return [
        d.structure,
        d.luminosity,
        d.resonance,
        d.entropy,
        d.cognitive_rigidness,
        Math.round(soul.density * 100)
    ];
}
