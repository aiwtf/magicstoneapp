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
 * Validates and parses the Soul JSON string.
 * @param jsonString The raw string pasted by the user.
 * @param expectedNonce The nonce that was generated for this session.
 * @throws Error if JSON is invalid or nonce mismatches.
 */
export function validateSoulJSON(jsonString: string, expectedNonce: string): SoulJSON {
    // 1. Clean the string (remove potential markdown wrappers)
    const cleaned = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();

    // 2. Parse JSON
    let data: any;
    try {
        // Try to find the JSON object if there's surrounding text
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        const toParse = jsonMatch ? jsonMatch[0] : cleaned;
        data = JSON.parse(toParse);
    } catch (e) {
        throw new Error("The text is not a valid soul artifact (Invalid JSON).");
    }

    // 3. Verify Nonce
    if (data.verification_code !== expectedNonce) {
        throw new Error(`Soul Signature Mismatch. Expected code: ${expectedNonce}`);
    }

    // 4. Validate Schema (Basic check)
    if (!data.archetype || !data.soul_color || !data.dimensions) {
        throw new Error("The soul data is incomplete.");
    }

    return data as SoulJSON;
}
