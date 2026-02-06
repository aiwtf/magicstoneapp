export interface SoulDimensions {
    chaos: number;
    logic: number;
    empathy: number;
    mysticism: number;
}

export interface SoulJSON {
    verification_code: string;
    archetype: string;
    dimensions: SoulDimensions;
    visual_seed: string; // Used to seed the procedural generation
    soul_color: string;
    keywords: string[];
    summary: string;
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

    // Schema Validation (Basic)
    if (!data.archetype || !data.soul_color || !data.dimensions) {
        throw new Error(" The Soul is fragmented. (Missing required fields)");
    }

    return data as SoulJSON;
}
