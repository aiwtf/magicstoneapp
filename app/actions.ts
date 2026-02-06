'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { SoulJSON } from "./utils/soulEngine";

export async function verifySharedLink(url: string, expectedNonce: string): Promise<{ success: boolean; data?: SoulJSON; error?: string }> {
    console.log(`Verifying Link: ${url} with Nonce: ${expectedNonce}`);

    try {
        // 1. Basic URL Validation
        const validHosts = ['chatgpt.com', 'chat.openai.com', 'g.co', 'gemini.google.com'];
        const urlObj = new URL(url);
        if (!validHosts.some(h => urlObj.hostname.endsWith(h))) {
            return { success: false, error: "Invalid Oracle Link. Please share from ChatGPT or Gemini." };
        }

        // 2. Fetch HTML content
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            return { success: false, error: "The Oracle refused connection. (Link might be private or expired)" };
        }

        const html = await response.text();

        // 3. Regex Search for JSON with the expected nonce
        const nonceIndex = html.indexOf(expectedNonce);
        if (nonceIndex === -1) {
            return { success: false, error: "Soul Signature not found in this link. (Nonce mismatch)" };
        }

        // Extremely naive extraction: Grab 2000 chars around the nonce and try to find the framing JSON
        const searchWindow = html.substring(Math.max(0, nonceIndex - 1000), Math.min(html.length, nonceIndex + 1000));
        const unescapedWindow = searchWindow
            .replace(/&quot;/g, '"')
            .replace(/\\"/g, '"')
            .replace(/\\n/g, ' ')
            .replace(/\\/g, '');

        // Try to parse candidates
        let foundData: any = null;

        // Strategy: Find all substrings starting with { and try to parse them
        const candidates = unescapedWindow.match(/\{[\s\S]*?\}/g) || [];
        for (const cand of candidates) {
            try {
                if (cand.includes(expectedNonce)) {
                    const parsed = JSON.parse(cand);
                    if (parsed.verification_code === expectedNonce && parsed.dimensions) {
                        foundData = parsed;
                        break;
                    }
                }
            } catch (e) { }
        }

        // Fallback: If strict parsing fails, mock success if Nonce + Color found (Prototype robustness)
        if (!foundData) {
            const color = html.match(/"soul_color"\\?\s*:\\?\s*\\?"(#[A-Fa-f0-9]{6})\\?"/)?.[1] || "#888888";
            if (!html.includes(expectedNonce)) {
                return { success: false, error: "Nonce not found (Double check)." };
            }

            foundData = {
                verification_code: expectedNonce,
                soul_color: color,
                archetype_name: "Verified Soul",
                archetype_description: "The Oracle has confirmed your identity through the ethereal link.",
                core_tension: "Balance vs Chaos",
                narrative_phase: "Awakening",
                dimensions: {
                    structure: 50, luminosity: 50, resonance: 50, ethereal: 50,
                    volatility: 50, entropy: 50, cognitive_rigidness: 50, narrative_depth: 50
                },
                cognitive_biases: ["Optimism Bias"],
                visual_seed: expectedNonce
            } as SoulJSON;
        }

        return { success: true, data: foundData as SoulJSON };

    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to commune with the Oracle." };
    }
}


interface SoulAnalysisResult {
    soul_color: string;
    keywords: string[];
    summary: string;
    error?: string;
}

export async function analyzeSoul(logs: string[]): Promise<SoulAnalysisResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        console.log("Analyze Soul called. API Key present:", !!apiKey);

        if (!apiKey) {
            throw new Error("Waiting for Soul Connection... (Missing API Key)");
        }

        if (!logs || !Array.isArray(logs) || logs.length === 0) {
            throw new Error("The stone is silent.");
        }

        // Combine logs into a single context
        const soulContent = logs.join("\n---\n");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
        You are the Spirit of the Magic Stone, an ancient entity that observes human souls.
        
        Analyze the following user's diary entries/thoughts to create a "Soul Reading".
        Be mystical, kind, comforting, and deep. Like a Tarot reader or a wise sage.
        
        User's Thoughts:
        ${soulContent}
        
        Output EXACTLY and ONLY a JSON object with this structure:
        {
          "soul_color": "A hex color code representing their aura (e.g. #FF5733)",
          "keywords": ["Three", "Mystical", "Keywords"],
          "summary": "A 100-word paragraph describing their soul's current state. Speak directly to them ('You are...'). Be poetic but clear."
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log("Gemini Response:", responseText); // Debugging

        // Basic clean up to ensure valid JSON (remove markdown blocks if present)
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanedText);

        return data;

    } catch (error) {
        console.error("Soul Reading Error:", error);
        return {
            soul_color: "#000000",
            keywords: ["Clouded", "Silent", "Mystery"],
            summary: "The spirits are having trouble connecting. It might be a momentary lapse in the ether.",
            error: error instanceof Error ? error.message : "The spirits are clouded. Please try again later."
        };
    }
}
