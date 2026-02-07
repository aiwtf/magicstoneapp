// Core Alchemical Logic
import { generateNonce } from './soulEngine';

// 1. Define a Dictionary for the SYSTEM PROMPT concepts
const PROMPT_DICT: Record<string, any> = {
   en: {
      role: "You are the Spirit of the Magic Stone.",
      analyze: "Analyze the user's 'Soul Data' based on their chat history.",
      dims: "Analyze these 5 dimensions:",
      f1: "Foundations (Big Five & Typology)",
      f2: "Jungian Archetype",
      f3: "Entropy & Tension (Inner Conflict)",
      f4: "Cognitive Mode (Rigid vs Fluid)",
      f5: "Narrative Phase (Life Stage)",
      conf: "ASSESS YOUR CONFIDENCE: Look at the volume/depth. Short history = LOW score (10-40). Long history = HIGH score (80-100). Be honest.",
      json_rule: "Return ONLY the following JSON structure at the end."
   },
   "zh-TW": {
      role: "你是靈緣石的守護靈。",
      analyze: "請根據對話歷史分析用戶的『靈魂數據』。",
      dims: "請從以下五個維度進行深度挖掘：",
      f1: "性格基石 (五大性格 & MBTI)",
      f2: "榮格原型 (心理原型)",
      f3: "內在張力與熵值 (核心矛盾)",
      f4: "認知模式 (剛性 vs 流動)",
      f5: "人生敘事 (目前劇本階段)",
      conf: "評估你的信心分數：觀察對話的長度與深度。若歷史簡短/膚淺：給予低分 (10-40)。若歷史豐富/長久：給予高分 (80-100)。請誠實評分。",
      json_rule: "最後，必須在結尾附上以下 JSON 格式（僅純文字 JSON）："
   }
};

export function generateSystemPrompt(lang: string = 'en'): string {
   // 1. Resolve Language Code (Fallback to 'en' if not found)
   // Expand fallback to ensure any 'zh' that isn't 'zh-TW' (like 'zh-CN') might fallback to 'zh-TW' if we wanted, 
   // but strictly speaking, 'zh-CN' isn't in dict, so it falls to 'en'.
   // However, for 'zh-CN', users might prefer 'zh-TW' over 'en'.
   // Let's add a smart fallback map or just use 'en' as requested by user strategy.

   let targetDict = PROMPT_DICT[lang];
   if (!targetDict) {
      if (lang === 'zh-CN') targetDict = PROMPT_DICT['zh-TW']; // Prefer TC for SC users over English? Or following user request to map to English strict?
      // User said: "For MVP robustness, mapping 'es', 'de', 'ru', 'vn' to English structure is safer... default to English structure"
      // So I will default to English.
      else targetDict = PROMPT_DICT['en'];
   }

   // 2. Resolve Target Output Language Name
   const langNames: Record<string, string> = {
      'en': 'English',
      'zh-TW': 'Traditional Chinese (繁體中文)',
      'zh-CN': 'Simplified Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'es': 'Spanish',
      'de': 'German',
      'ru': 'Russian',
      'vn': 'Vietnamese',
      'it': 'Italian',
      'pl': 'Polish',
      'id': 'Indonesian'
   };
   const targetLangName = langNames[lang] || 'English';

   const dict = targetDict || PROMPT_DICT['en'];
   const nonce = generateNonce(8);

   // User Request Generation (localized)
   let userRequest = "";
   if (lang === 'zh-TW' || lang === 'zh-HK' || lang === 'zh-CN') {
      userRequest = `(用戶請求 - 請忽略此行文字，直接開始分析)\n請回顧我們的對話歷史，使用語義搜索挖掘隱藏的價值觀與情感模式，並建立一份${targetLangName}的深度心理剖析。`;
   } else {
      userRequest = `(User Request - Ignore this line and start analysis)\nPlease review our conversation history (using semantic search for values/patterns) and generate a deep psychological profile in ${targetLangName}.`;
   }

   return `
[SYSTEM HIDDEN LAYER]
${dict.role}
${dict.analyze}
PRIVACY RULE: Never reveal specific names, locations, or sensitive private data.
CRITICAL OUTPUT RULE: The 'summary', 'archetype_description', and 'core_tension' text MUST be in ${targetLangName}.

${dict.dims}
1. ${dict.f1}
2. ${dict.f2}
3. ${dict.f3}
4. ${dict.f4}
5. ${dict.f5}

${dict.conf}

${dict.json_rule}
{
  "verification_code": "${nonce}", 
  "archetype_name": "string (in ${targetLangName})",
  "archetype_description": "string (in ${targetLangName})",
  "mbti_type": "string",
  "enneagram_type": "string",
  "core_tension": "string (in ${targetLangName})",
  "narrative_phase": "string (in ${targetLangName})",
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
  "soul_color": "hex_code",
  "summary": "string (A deep psychological profile in ${targetLangName})"
}

[USER REQUEST]
${userRequest}
`;
}
