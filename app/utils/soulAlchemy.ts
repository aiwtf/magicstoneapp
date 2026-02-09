// Core Alchemical Logic
import { generateNonce } from './soulEngine';
import { SYSTEM_PROMPT_TEMPLATE, PROMPT_DICT_CONST } from '../constants';

// 1. Define a Dictionary for the SYSTEM PROMPT concepts
const PROMPT_DICT = PROMPT_DICT_CONST;

export function generateSystemPrompt(lang: string = 'en'): string {
   // The new protocol is strict Traditional Chinese, so 'lang' arg is largely ignored
   // but kept for interface compatibility.

   // We append the visual delimiter for the user to paste their history.
   return SYSTEM_PROMPT_TEMPLATE + "\n(在此貼上您的對話紀錄 / Paste your chat history here):";
}
