export interface SoulDimensions {
    chaos: number;
    logic: number;
    empathy: number;
    mysticism: number;
}

export interface SoulJSON {
    verification_code?: string;
    density_boost?: number;
    archetype: string;
    keywords: string[];
    summary?: string;
    dimensions: {
        chaos: number;
        logic: number;
        empathy: number;
        mysticism: number;
    };
    visual_seed: string;
    soul_color?: string;
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
export function extractSoulJSON(text: string, expectedNonce: string): SoulJSON {
    // 1. Try to find the nonce location
    const nonceIndex = text.indexOf(expectedNonce);
    if (nonceIndex === -1) {
        throw new Error("No Soul Resonance found. (Verification Code missing)");
    }

    // Try 1: Clean markdown code blocks
    const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
        try {
            const data = JSON.parse(codeBlockMatch[1]);
            if (data.verification_code === expectedNonce) return validateSoulJSON(JSON.stringify(data), expectedNonce);
        } catch (e) { }
    }

    // Try 2: Clean and parse whole text
    const cleanText = text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    try {
        const data = JSON.parse(cleanText);
        if (data.verification_code === expectedNonce) return validateSoulJSON(JSON.stringify(data), expectedNonce);
    } catch (e) { }

    // Try 3: Heuristic extraction around the nonce
    const openBrace = cleanText.lastIndexOf('{', nonceIndex);
    if (openBrace !== -1) {
        let balance = 1;
        for (let i = openBrace + 1; i < cleanText.length; i++) {
            if (cleanText[i] === '{') balance++;
            if (cleanText[i] === '}') balance--;

            if (balance === 0) {
                const candidate = cleanText.substring(openBrace, i + 1);
                try {
                    return validateSoulJSON(candidate, expectedNonce);
                } catch (e) { }
                break;
            }
        }
    }

    // Fallback: validate what we can
    throw new Error("Fragments found, but the Soul is incomplete.");
}

/**
 * Validates and parses the Soul JSON string.
 */
export function validateSoulJSON(jsonString: string, expectedNonce: string): SoulJSON {
    // Basic cleaning to handle potential Markdown code blocks if user copies too much
    const cleanString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();

    let data;
    try {
        data = JSON.parse(cleanString);
    } catch (e) {
        throw new Error("The scroll is illegible. (Invalid JSON format)");
    }

    if (data.verification_code !== expectedNonce) {
        // Security check
        throw new Error(`Soul Signature Mismatch. Expected code: ${expectedNonce}`);
    }

    // ... existing validation logic ...

    // Schema Validation (Basic)
    if (!data.archetype || !data.soul_color || !data.dimensions) {
        throw new Error(" The Soul is fragmented. (Missing required fields)");
    }

    return data as SoulJSON;
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
            chaos: rng.next() * 2 - 1,   // -1 to 1
            logic: rng.next() * 2 - 1,
            empathy: rng.next() * 2 - 1,
            mysticism: rng.next() * 2 - 1
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
            (dims.chaos * plane.chaos) +
            (dims.logic * plane.logic) +
            (dims.empathy * plane.empathy) +
            (dims.mysticism * plane.mysticism);

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
