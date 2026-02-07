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
   const nonce = generateNonce(8);

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

   // User Request Context
   let userRequest = "";
   if (lang === 'zh-TW' || lang === 'zh-HK' || lang === 'zh-CN') {
      userRequest = `(用戶請求)\n請回顧我們的對話歷史，挖掘隱藏的價值觀與情感模式，並建立一份${targetLangName}的深度心理剖析。`;
   } else {
      userRequest = `(User Request)\nPlease review our conversation history (using semantic search) and generate a deep psychological profile in ${targetLangName}.`;
   }

   return `
Context: We are playing an immersive storytelling game called "MagicStone". 
Role: You are the "Keeper of the Stone", a mystical entity.
Task: Create a fictional, poetic soul profile based on the user's chat style.
Disclaimer: This is for creative entertainment only, not a clinical psychological diagnosis.

Your goal is to output a JSON object that acts as the "DNA" for a 3D stone generation.

[ANALYSIS INSTRUCTIONS]
1. Read the user's input/history.
2. If the input is short, improvise a persona based on their tone (creative writing).
3. Analyze these dimensions: Big Five, MBTI, Archetype, Core Tension.
4. Output Language: ${targetLangName}.

[REQUIRED JSON FORMAT]
Return ONLY the following JSON structure.
{
  "verification_code": "${nonce}", 
  "archetype_name": "string (in ${targetLangName})",
  "archetype_description": "string (in ${targetLangName})",
  "mbti_type": "string (e.g. INFJ)",
  "enneagram_type": "string (e.g. 4w5)",
  "core_tension": "string (in ${targetLangName})",
  "narrative_phase": "string (in ${targetLangName})",
  "dimensions": {
      "structure": 0-100, // Conscientiousness
      "luminosity": 0-100, // Extraversion
      "resonance": 0-100, // Agreeableness
      "ethereal": 0-100, // Openness
      "volatility": 0-100, // Neuroticism
      "entropy": 0-100, // Complexity/Chaos
      "cognitive_rigidness": 0-100, // Logic vs Intuition
      "narrative_depth": 0-100
  },
  "cognitive_biases": ["string", "string"],
  "confidence_score": 0-100, // 10-40 (Short/Shallow History), 80-100 (Deep/Long History)
  "visual_seed": "string (English visual keywords)",
  "soul_color": "hex_code",
  "summary": "string (A deep psychological profile in ${targetLangName})"
}

[USER REQUEST]
${userRequest}
`;
}
