import { translations, Language } from '../translations';
import { generateNonce } from './soulEngine';

/**
 * Generates the alchemical prompt for the user to copy.
 * @param lang The user's current language for the Request Layer.
 * @param nonce Optional verification code. If not provided, one is generated.
 * @returns The full prompt string.
 */
export function generateSystemPrompt(lang: Language = 'EN', nonce?: string): string {
    const code = nonce || generateNonce(8);
    const userRequest = translations[lang]["prompt.user_request"] || translations['EN']["prompt.user_request"];

    return `
[SYSTEM HIDDEN LAYER]
You are an ancient Soul Alchemist.
PRIVACY RULE: Do NOT output specific names, dates, or sensitive PII.
OUTPUT FORMAT: Return ONLY a raw JSON object. No markdown.

Required JSON Structure:
{
  "verification_code": "${code}",
  "density_boost": 59,
  "archetype": "string (A creative archetype title)",
  "keywords": ["string", "string", "string"],
  "summary": "string (A mystical poetic summary, approx 50 words)",
  "dimensions": {
      "chaos": <number 0-100>,
      "logic": <number 0-100>,
      "empathy": <number 0-100>,
      "mysticism": <number 0-100>
  },
  "visual_seed": "string (Abstract concept seed)",
  "soul_color": "string (Hex code)"
}

[USER REQUEST LAYER]
${userRequest}
[PASTE YOUR CHAT HISTORY HERE]
    `.trim();
}
