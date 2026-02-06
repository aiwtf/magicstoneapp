import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Waiting for Soul Connection... (Missing API Key)" }, { status: 500 });
        }

        const { logs } = await req.json();

        if (!logs || !Array.isArray(logs) || logs.length === 0) {
            return NextResponse.json({ error: "The stone is silent." }, { status: 400 });
        }

        // Combine logs into a single context
        const soulContent = logs.join("\n---\n");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

        // Basic clean up to ensure valid JSON (remove markdown blocks if present)
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanedText);

        return NextResponse.json(data);

    } catch (error) {
        console.error("Soul Reading Error:", error);
        return NextResponse.json(
            { error: "The spirits are clouded. Please try again later." },
            { status: 500 }
        );
    }
}
