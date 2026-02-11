import { SYSTEM_PROMPT_TEMPLATE } from '../constants';

export interface SoulDimensions {
    structure: number;      // Conscientiousness
    luminosity: number;     // Extraversion
    resonance: number;      // Agreeableness
    ethereal: number;       // Openness
    volatility: number;     // Neuroticism
    entropy: number;        // Complexity
    cognitive_rigidness: number; // Logic vs Intuition
    narrative_depth: number; // Story depth
}

export interface DeepSoulAnalysis {
    unlived_potential: string;
    shadow_traits: string;
    karmic_anchor?: string; // Legacy or alternative
    karmic_lesson: string;  // Deep Protocol
}

export interface OperatingSystem {
    decision_model: string;
    emotional_structure: string;
    crisis_mode: string;
    cognitive_bias: string; // Deep Protocol
}

export interface SynchronizationMeta {
    level: 1 | 2 | 3;
    rate: number; // 0-100
    missing_data_reason: string;
    is_ready_for_matching: boolean;
}

export interface MatchingProtocol {
    communication_style: string;
    conflict_resolution: string;
    ideal_complement: string;
    deal_breaker: string;
}

export interface SoulJSON {
    verification_code?: string;

    // Truth Protocol: Synchronization Metadata
    synchronization?: SynchronizationMeta;

    // Core Identity (Level 1+ — Always Available)
    soul_title: string;
    confidence_score: number;
    archetype?: {
        name: string;
        description: string;
        mbti?: string;
        enneagram?: string;
    };

    // Level 2+ — Nullable
    core_tension: {
        conflict: string;
        description: string;
    } | null;
    operating_system: OperatingSystem | null;

    // Level 3 Only — Nullable
    depth_analysis: DeepSoulAnalysis | null;
    matching_protocol: MatchingProtocol | null;

    // Always Available
    resonance?: {
        visual_aesthetic: string;
        philosophical_root: string;
    };
    essence_summary: string;

    // Derived/Legacy Fields for Compatibility
    archetype_name?: string;
    archetype_description?: string;
    dimensions?: SoulDimensions;
    soul_color?: string;
    keywords?: string[];
}

/**
 * Deterministically generates 0-100 dimensions from a text seed.
 * Ensures the same soul description always yields the same "shape".
 */
function deriveDimensions(seedText: string): SoulDimensions {
    const simpleHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    };

    const getScore = (salt: string) => (simpleHash(seedText + salt) % 100);

    return {
        structure: getScore("structure"),
        luminosity: getScore("luminosity"),
        resonance: getScore("resonance"),
        ethereal: getScore("ethereal"),
        volatility: getScore("volatility"),
        entropy: getScore("entropy"),
        cognitive_rigidness: getScore("cognitive"),
        narrative_depth: getScore("narrative")
    };
}

/**
 * Derives a hex color from text.
 */
function deriveColor(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + "00000".substring(0, 6 - c.length) + c;
}

export function generateNonce(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function extractSoulJSON(text: string): SoulJSON {
    try {
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "");
        const firstOpen = cleanText.indexOf('{');
        const lastClose = cleanText.lastIndexOf('}');

        if (firstOpen === -1 || lastClose === -1) {
            throw new Error("JSON brackets {} not found.");
        }

        const jsonString = cleanText.substring(firstOpen, lastClose + 1);
        const data = JSON.parse(jsonString);

        // --- Deep Protocol Adaptation Layer ---

        // 1. Ensure Dimensions exist (Derive if missing)
        if (!data.dimensions) {
            // Use title + conflict as seed
            const seed = (data.soul_title || "") + (data.core_tension?.conflict || "");
            data.dimensions = deriveDimensions(seed);
        }

        // 2. Map Legacy Fields
        if (!data.archetype_name) data.archetype_name = data.soul_title;
        if (!data.archetype_description) data.archetype_description = data.essence_summary;

        // 3. Derive Color & Keywords
        if (!data.soul_color) {
            data.soul_color = deriveColor(data.soul_title || "soul");
        }
        if (!data.keywords) {
            data.keywords = [
                data.archetype?.name,
                data.archetype?.mbti,
                data.operating_system?.decision_model?.substring(0, 6)
            ].filter(Boolean);
        }

        return data as SoulJSON;
    } catch (err) {
        console.error("Parsing Error:", err);
        throw new Error("無法辨識靈魂數據。請確認您複製了包含 {...} 的完整 AI 回覆。");
    }
}

// --- SOUL RADAR LSH LOGIC ---

// A simple seeded random number generator (Linear Congruential Generator)
// to ensure all clients generate the SAME "random" projection vectors.
class SeededRNG {
    private seed: number;
    constructor(seed: number) { this.seed = seed; }
    next(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

// Generate 128 fixed 4D projection vectors once.
// We use a fixed seed (e.g., 42) so every app instance has the same "Hyperplanes".
const HASH_BITS = 128;
const PROJECTION_VECTORS: SoulDimensions[] = (() => {
    const rng = new SeededRNG(42);
    const vectors: SoulDimensions[] = [];
    for (let i = 0; i < HASH_BITS; i++) {
        vectors.push({
            structure: rng.next() * 2 - 1,
            luminosity: rng.next() * 2 - 1,
            resonance: rng.next() * 2 - 1,
            ethereal: rng.next() * 2 - 1,
            volatility: rng.next() * 2 - 1,
            entropy: rng.next() * 2 - 1,
            cognitive_rigidness: rng.next() * 2 - 1,
            narrative_depth: rng.next() * 2 - 1
        });
    }
    return vectors;
})();

/**
 * Generates a 128-bit Locality Sensitive Hash (SimHash) from Soul Dimensions.
 * Returns a string of 128 '0's and '1's.
 */
export function generateSoulHash(dims: SoulDimensions): string {
    // Normalize dimensions to 0-1 range roughly, or just use raw if they carry weight.
    // Our dimensions are 0-100.
    // Vector V = [chaos, logic, empathy, mysticism]
    // Hash bit i = 1 if (V dot H_i) >= 0, else 0

    let hash = '';
    for (const plane of PROJECTION_VECTORS) {
        const dotProduct =
            (dims.structure * plane.structure) +
            (dims.luminosity * plane.luminosity) +
            (dims.resonance * plane.resonance) +
            (dims.ethereal * plane.ethereal) +
            (dims.volatility * plane.volatility) +
            (dims.entropy * plane.entropy) +
            (dims.cognitive_rigidness * plane.cognitive_rigidness) +
            (dims.narrative_depth * plane.narrative_depth);

        hash += (dotProduct >= 0) ? '1' : '0';
    }
    return hash;
}

/**
 * Calculates the Resonance Score (Similarity) between two Soul Hashes.
 * Returns a percentage 0-100.
 */
export function calculateResonance(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) return 0;

    let hammingDistance = 0;
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] !== hash2[i]) {
            hammingDistance++;
        }
    }

    // Similarity = 1 - (Distance / MaxDistance)
    const similarity = 1 - (hammingDistance / hash1.length);

    // Scale to percentage integer
    return Math.round(similarity * 100);
}

/**
 * Generates the Incantation (System Prompt) with a dynamic Nonce embedded.
 * Used by the Modal for manual copy-paste.
 */
export function generateIncantation(nonce: string): string {
    return SYSTEM_PROMPT_TEMPLATE.replace('{{NONCE}}', nonce);
}
