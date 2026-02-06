'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

interface SoulAnalysisResult {
    soul_color: string;
    keywords: string[];
    summary: string;
    error?: string;
}

export async function analyzeSoul(logs: string[]): Promise<SoulAnalysisResult> {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
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
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
            error: (error instanceof Error ? error.message : "The spirits are clouded.") + ` (Key used: ${apiKey ? apiKey.substring(0, 5) + '...' : 'undefined'})`
        };
    }
}
