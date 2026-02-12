import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: "No code provided" }, { status: 400 });
        }

        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
        const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

        if (!clientId || !clientSecret || !redirectUri) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", redirectUri);

        const checkRes = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
            },
            body: params,
        });

        const data = await checkRes.json();

        if (!checkRes.ok) {
            console.error("Spotify Token Error:", data);
            return NextResponse.json({ error: data.error_description || "Failed to fetch token" }, { status: checkRes.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Auth Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
