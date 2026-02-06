// Core Alchemical Logic
import { generateNonce } from './soulEngine';

/**
 * Generates the alchemical prompt for the user to copy.
 */
export function generateSystemPrompt(lang: string = 'EN', nonce?: string): string {
   const code = nonce || generateNonce(8);
   // ... prompt ...
   return `请回顾我们的全部对话历史（如果支持，使用语义搜索工具查找关键主题，如价值观、情感表达、决策模式），对我的内在进行一次极限深度的心理剖析。


请从以下五个维度进行深度挖掘：

1. **性格基石 (Foundations):**
   - 五大性格特质 (Big Five)：分析我的尽责性 (Structure)、外向性 (Luminosity)、亲和性 (Resonance)、开放性 (Ethereal) 與情绪敏感度 (Volatility)。
   - 类型学标签：判断我的 MBTI 类型（如 INTJ）与 Enneagram 核心型（如 Type 4）。

2. **荣格原型 (Archetype):**
   - 判断我最符合哪一种心理原型（如：智者、创造者、反叛者、无辜者），并解释原因。

3. **内在张力与复杂度 (Entropy & Tension):**
   - 核心张力 (Core Tension)：找出驱动我人生的最大矛盾（例如：追求自由 vs 渴望归属）。
   - 熵值 (Entropy)：分析我的内心是单纯直率，还是充满矛盾与混沌？

4. **认知模式 (Cognition):**
   - 认知刚性 (Cognitive Rigidness)：我的思维是结构化/原则导向的（高刚性），还是流动/直觉导向的（低刚性）？
   - 认知偏见：我在对话中常显现的盲点（如确认偏差）。

5. **人生叙事 (Narrative):**
   - 描述我目前正处于人生剧本的哪个阶段（例如：觉醒期、深渊试炼、归乡）。

---

**ASSESS YOUR CONFIDENCE:**
Look at the volume and depth of the chat history provided.
- If the history is short/superficial: Set 'confidence_score' LOW (10-40).
- If the history is rich/long: Set 'confidence_score' HIGH (80-100).
- Be honest. Do not fake confidence.

${(lang === 'zh-TW' || lang === 'TW') ? "**CRITICAL OUTPUT RULE:** You MUST write the summary and analysis in Traditional Chinese (繁體中文). Do NOT use Simplified Chinese." : ""}

---

最后，为了配合『灵缘石 (MagicStone)』应用程式的生成，请务必在回复的最后附上以下 JSON 格式（严禁 Markdown 代码块，仅纯文本 JSON）：

{
  "verification_code": "${code}",
  "archetype_name": "string (例如：孤独的开拓者)",
  "archetype_description": "string (一句话描述)",
  "mbti_type": "string",
  "enneagram_type": "string",
  "keywords": ["tag1", "tag2"],
  "core_tension": "string (例如：自由 vs 归属)",
  "narrative_phase": "string (例如：深渊试炼)",
  "dimensions": {
    "structure": 0-100,      // 尽责性/Conscientiousness -> Roughness
    "luminosity": 0-100,     // 外向性/Extraversion -> Emissive Power
    "resonance": 0-100,      // 亲和性/Agreeableness -> Warmth
    "ethereal": 0-100,       // 开放性/Openness -> Transmission
    "volatility": 0-100,     // 情绪敏感度/Neuroticism -> Pulse Speed
    "entropy": 0-100,        // 复杂与混沌度 -> Pulse Intensity
    "cognitive_rigidness": 0-100, // 0=Organic, 100=Structured
    "narrative_depth": 0-100 // 故事的厚度
  },
  "cognitive_biases": ["string", "string"],
  "confidence_score": 0-100,
  "visual_seed": "string",
  "soul_color": "hex_code"
}

User History to Analyze:
[PASTE YOUR CHAT HISTORY HERE]`;
}
