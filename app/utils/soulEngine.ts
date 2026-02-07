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

export interface SoulJSON {
    verification_code?: string;
    // Generated or Enhanced fields
    visual_seed?: string;
    soul_color?: string;
    keywords?: string[];

    // Core AI Response
    archetype_name: string;
    archetype_description?: string;
    mbti_type?: string;
    enneagram_type?: string;
    core_tension: string;
    narrative_phase: string;
    dimensions: SoulDimensions;
    cognitive_biases: string[];
    confidence_score?: number;
}

/**
 * Generates a random nonce string for verification.
 * @param length Length of the string (default 8)
 */
export function generateNonce(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generates the system prompt (Incantation) for the user to copy.
 * @param nonce The verification code to include in the prompt.
 */
export function generateIncantation(nonce: string): string {
    return `You are the Spirit of the Magic Stone, an ancient entity that observes human souls.
Analyze the provided chat history/diary entries to extract "Soul Data".

PRIVACY RULE: 
You must NEVER output specific details, names, locations, or sensitive text from the user's history. 
Only output abstract Archetype names, Keywords, and Numerical scores (0-100). 
The user will review this JSON, so keep it abstract.

CRITICAL INSTRUCTION:
You must Output EXACTLY and ONLY a JSON object with the following structure. 
Do not include any markdown formatting (like \`\`\`json), just the raw JSON string.

Required JSON Structure:
{
  "verification_code": "${nonce}",
  "archetype": "A creative archetype name (e.g. 'The Velvet Storm', 'The Silent Observer')",
  "soul_color": "A hex color code representing my aura (e.g. #FF5733)",
  "keywords": ["Keyword1", "Keyword2", "Keyword3"],
  "summary": "A mystical poetic summary of my soul (approx 50 words).",
  "dimensions": {
      "chaos": <number 0-100>,
      "logic": <number 0-100>,
      "empathy": <number 0-100>,
      "mysticism": <number 0-100>
  },
  "visual_seed": "A random string based on my vibe"
}

User History to Analyze:
[PASTE YOUR CHAT HISTORY HERE]`;
}

/**
 * Extracts SoulJSON from a larger text block (e.g. mixed response from AI).
 * @param text The text to search in.
 * @param expectedNonce The nonce to verify against.
 */
/**
 * Extracts SoulJSON from a larger text block (e.g. mixed response from AI).
 * Uses robust substring extraction to find the JSON block.
 */
export function extractSoulJSON(text: string): SoulJSON {
    try {
        // 1. Pre-cleaning: Remove markdown code blocks if present
        let cleanText = text.replace(/```json/g, "").replace(/```/g, "");

        // 2. Find the *First* '{' and *Last* '}'
        const firstOpen = cleanText.indexOf('{');
        const lastClose = cleanText.lastIndexOf('}');

        if (firstOpen === -1 || lastClose === -1) {
            throw new Error("JSON brackets {} not found.");
        }

        // 3. Extract just the JSON part
        const jsonString = cleanText.substring(firstOpen, lastClose + 1);

        // 4. Parse
        const data = JSON.parse(jsonString);

        // 5. Basic Validation
        if (!data.dimensions) throw new Error("Missing dimensions.");

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
