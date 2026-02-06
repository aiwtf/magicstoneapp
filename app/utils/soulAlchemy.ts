// Core Alchemical Logic
import { generateNonce } from './soulEngine';

/**
 * Generates the alchemical prompt for the user to copy.
 */
export function generateSystemPrompt(lang: string = 'EN', nonce?: string): string {
   const code = nonce || generateNonce(8);

   // 1. User Request (Language Specific)
   let userRequest = "";
   if (lang === 'zh-TW' || lang === 'TW') {
      userRequest = "請回顧我們的對話歷史（如果支持，使用語義搜索工具查找關鍵主題，如價值觀、情感表達、決策模式），對我的內在進行一次極限深度的心理剖析。";
   } else {
      userRequest = `Please review our entire conversation history (use semantic search if available for key themes like values, emotional expression, decision patterns) and perform an ultra-deep psychological analysis of my inner self.`;
   }

   // 2. System Instruction (Hidden Layer)
   const baseInstruction = `
[SYSTEM HIDDEN LAYER]
You are the Spirit of the Magic Stone.
Analyze the user's "Soul Data" based on their chat history.

PRIVACY RULE: Never reveal specific names, locations, or sensitive private data. Use abstract archetypes and psychological terms.

CRITICAL OUTPUT RULE: ${(lang === 'zh-TW' || lang === 'TW') ? "You MUST usage Traditional Chinese (繁體中文) for all analysis text. Do NOT use Simplified Chinese." : "Output in the requested language."}
`;

   // 3. Analysis Dimensions
   const analysisDimensions = `
请从以下五个维度进行深度挖掘 (Analyze these 5 dimensions):

1. **性格基石 (Foundations):**
   - Five Factor (Big Five): Structure (Conscientiousness), Luminosity (Extraversion), Resonance (Agreeableness), Ethereal (Openness), Volatility (Neuroticism).
   - Typology: MBTI (e.g. INTJ) & Enneagram (e.g. Type 4).

2. **荣格原型 (Archetype):**
   - Which Jungian Archetype fits me best? (e.g. Sage, Creator, Outlaw).

3. **内在张力与复杂度 (Entropy & Tension):**
   - Core Tension: What is the biggest contradiction driving my life? (e.g. Freedom vs Belonging).
   - Entropy: Is my inner world simple/direct or chaotic/complex?

4. **认知模式 (Cognition):**
   - Cognitive Rigidness: Am I structured/principled (High Rigidness) or fluid/intuitive (Low Rigidness)?
   - Cognitive Biases: My blind spots (e.g. Confirmation Bias).

5. **人生叙事 (Narrative):**
   - Current Narrative Phase: (e.g. The Awakening, The Abyss, The Return).
`;

   // 4. Confidence & JSON
   const confidenceAndFormat = `
---

**ASSESS YOUR CONFIDENCE:**
Look at the volume and depth of the chat history provided.
- If the history is short/superficial: Set 'confidence_score' LOW (10-40).
- If the history is rich/long: Set 'confidence_score' HIGH (80-100).
- Be honest. Do not fake confidence.

${(lang === 'zh-TW' || lang === 'TW') ? "**CRITICAL OUTPUT RULE:** You MUST write the summary and analysis in Traditional Chinese (繁體中文). Do NOT use Simplified Chinese." : ""}

---

Finally, MUST append the following JSON at the end (Raw JSON only, no markdown):

{
  "verification_code": "${code}",
  "archetype_name": "string (e.g. 孤獨的開拓者)",
  "archetype_description": "string (One sentence description)",
  "mbti_type": "string",
  "enneagram_type": "string",
  "keywords": ["tag1", "tag2"],
  "core_tension": "string (e.g. 自由 vs 歸屬)",
  "narrative_phase": "string (e.g. 深淵試煉)",
  "dimensions": {
    "structure": 0-100,
    "luminosity": 0-100,
    "resonance": 0-100,
    "ethereal": 0-100,
    "volatility": 0-100,
    "entropy": 0-100,
    "cognitive_rigidness": 0-100,
    "narrative_depth": 0-100
  },
  "cognitive_biases": ["string", "string"],
  "confidence_score": 0-100,
  "visual_seed": "string",
  "soul_color": "hex_code"
}`;

   return `${baseInstruction}\n\n${analysisDimensions}\n\n${confidenceAndFormat}\n\n[USER REQUEST]\n${userRequest}\n(Start Analysis now)`;
}
