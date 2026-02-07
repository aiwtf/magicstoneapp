import { supabase } from './supabaseClient';

export interface SoulSignal {
    id: string;          // Random ephemeral ID (UUID v4)
    geohash: string;     // The "Room" ID
    soul_vector: number[]; // Compressed stats
    timestamp: number;   // Unix timestamp
}

// TTL: 1 Hour in milliseconds
const SIGNAL_TTL = 60 * 60 * 1000;

/**
 * Broadcasts an anonymous signal to the Blind Relay.
 * @param signal The SoulSignal object
 */
export async function broadcastSignal(signal: SoulSignal): Promise<void> {
    const { error } = await supabase
        .from('soul_signals')
        .insert([
            {
                id: signal.id,
                geohash: signal.geohash,
                soul_vector: signal.soul_vector, // Stored as JSONB
                timestamp: signal.timestamp
            }
        ]);

    if (error) {
        console.error("Signal Broadcast Error:", error);
        throw new Error("Failed to broadcast signal.");
    }
}

/**
 * Scans for nearby signals in the same "Blind Box" (Geohash).
 * Filters out signals older than 1 hour.
 * @param myGeohash The user's current geohash
 * @returns List of active SoulSignal objects
 */
export async function scanNearbySignals(myGeohash: string): Promise<SoulSignal[]> {
    const oneHourAgo = Date.now() - SIGNAL_TTL;

    const { data, error } = await supabase
        .from('soul_signals')
        .select('*')
        .eq('geohash', myGeohash)
        .gt('timestamp', oneHourAgo); // Logic-based TTL filtering

    if (error) {
        console.error("Signal Scan Error:", error);
        return [];
    }

    return (data || []).map((row: any) => ({
        id: row.id,
        geohash: row.geohash,
        soul_vector: row.soul_vector,
        timestamp: parseInt(row.timestamp)
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
