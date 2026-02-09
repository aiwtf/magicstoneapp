// Core Alchemical Logic
import { generateNonce } from './soulEngine';
import { SYSTEM_PROMPT_TEMPLATE, PROMPT_DICT_CONST } from '../constants';

// 1. Define a Dictionary for the SYSTEM PROMPT concepts
const PROMPT_DICT = PROMPT_DICT_CONST;

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

   // Inject variables into template
   return SYSTEM_PROMPT_TEMPLATE
      .replace(/{{NONCE}}/g, nonce)
      .replace(/{{TARGET_LANG}}/g, targetLangName)
      .replace(/{{USER_REQUEST}}/g, userRequest);
}
