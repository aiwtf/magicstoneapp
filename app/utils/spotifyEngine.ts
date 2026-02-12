
export interface SpotifyTrack {
    id: string;
    name: string;
    artists: { name: string }[];
    album: {
        name: string;
        images: { url: string }[];
    };
    external_urls: {
        spotify: string;
    };
    preview_url: string | null;
}

const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
// Removed 'streaming' and 'user-modify-playback-state' to avoid Premium requirement
const SCOPES = ["user-read-private", "user-read-email", "user-top-read", "user-read-recently-played"];

// Fallback "Cosmic Hum" for tracks without preview_url (Free Tier limitation)
// Source: Pixabay (Royalty Free) - "Space Atmosphere"
export const FALLBACK_PREVIEW_URL = "https://cdn.pixabay.com/download/audio/2023/02/28/audio_550d815533.mp3?filename=space-atmosphere-14148.mp3";

// Mock Data for "Demo Mode" -> Using copyright-free ambient/lo-fi samples for the "Vibe"
const MOCK_TRACKS: SpotifyTrack[] = [
    {
        id: "mock1",
        name: "Daydreaming",
        artists: [{ name: "Radiohead" }],
        album: { name: "A Moon Shaped Pool", images: [{ url: "https://i.scdn.co/image/ab67616d0000b273c8b444df094279e70d0ed856" }] },
        external_urls: { spotify: "https://open.spotify.com/track/1" },
        preview_url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3" // Lofi Study
    },
    {
        id: "mock2",
        name: "Cornfield Chase",
        artists: [{ name: "Hans Zimmer" }],
        album: { name: "Interstellar OST", images: [{ url: "https://i.scdn.co/image/ab67616d0000b273b647eb38eb6555cc5dc1fc86" }] },
        external_urls: { spotify: "https://open.spotify.com/track/2" },
        preview_url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=ambient-piano-amp-drone-10781.mp3" // Ambient Piano
    },
    {
        id: "mock3",
        name: "Midnight City",
        artists: [{ name: "M83" }],
        album: { name: "Hurry Up, We're Dreaming", images: [{ url: "https://i.scdn.co/image/ab67616d0000b2739343c6cb2a297cce02ee3266" }] },
        external_urls: { spotify: "https://open.spotify.com/track/3" },
        preview_url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=soft-ambient-10383.mp3" // Soft Ambient
    },
    {
        id: "mock4",
        name: "Space Oddity",
        artists: [{ name: "David Bowie" }],
        album: { name: "David Bowie", images: [{ url: "https://i.scdn.co/image/ab67616d0000b273a21645e54807d885a1197825" }] },
        external_urls: { spotify: "https://open.spotify.com/track/4" },
        preview_url: "https://cdn.pixabay.com/download/audio/2023/02/28/audio_550d815533.mp3?filename=space-atmosphere-14148.mp3" // Space Atmosphere
    },
    {
        id: "mock5",
        name: "Instant Crush",
        artists: [{ name: "Daft Punk" }, { name: "Julian Casablancas" }],
        album: { name: "Random Access Memories", images: [{ url: "https://i.scdn.co/image/ab67616d0000b2735161f3660565575ad532286e" }] },
        external_urls: { spotify: "https://open.spotify.com/track/5" },
        preview_url: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_4f5685511b.mp3?filename=abstract-fashion-pop-123963.mp3" // Abstract Pop
    },
    {
        id: "mock6",
        name: "Wait",
        artists: [{ name: "M83" }],
        album: { name: "Hurry Up, We're Dreaming", images: [{ url: "https://i.scdn.co/image/ab67616d0000b2739343c6cb2a297cce02ee3266" }] },
        external_urls: { spotify: "https://open.spotify.com/track/6" },
        preview_url: "https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3?filename=relaxing-light-background-126840.mp3" // Relaxing Light
    },
    {
        id: "mock7",
        name: "Intro",
        artists: [{ name: "The xx" }],
        album: { name: "xx", images: [{ url: "https://i.scdn.co/image/ab67616d0000b2738d21af80718617565b90f421" }] },
        external_urls: { spotify: "https://open.spotify.com/track/7" },
        preview_url: "https://cdn.pixabay.com/download/audio/2022/03/09/audio_c8b6b215k2.mp3?filename=cinematic-atmosphere-score-10714.mp3" // Cinematic
    },
    {
        id: "mock8",
        name: "Heroes",
        artists: [{ name: "David Bowie" }],
        album: { name: "Heroes", images: [{ url: "https://i.scdn.co/image/ab67616d0000b27367c738a703dc979f4c6c4064" }] },
        external_urls: { spotify: "https://open.spotify.com/track/8" },
        preview_url: "https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1e65.mp3?filename=ambient-dream-10444.mp3" // Ambient Dream
    },
    {
        id: "mock9",
        name: "Dreams",
        artists: [{ name: "Fleetwood Mac" }],
        album: { name: "Rumours", images: [{ url: "https://i.scdn.co/image/ab67616d0000b273e8af0a1d496c58be8593cc8f" }] },
        external_urls: { spotify: "https://open.spotify.com/track/9" },
        preview_url: "https://cdn.pixabay.com/download/audio/2022/05/05/audio_1e3895e78c.mp3?filename=slow-motion-110006.mp3" // Slow Motion
    },
    {
        id: "mock10",
        name: "Ribs",
        artists: [{ name: "Lorde" }],
        album: { name: "Pure Heroine", images: [{ url: "https://i.scdn.co/image/ab67616d0000b273b5f7e7f62b48984954930e32" }] },
        external_urls: { spotify: "https://open.spotify.com/track/10" },
        preview_url: "https://cdn.pixabay.com/download/audio/2022/10/05/audio_68637d1773.mp3?filename=waves-121516.mp3" // Waves
    }
];

export const getSpotifyAuthUrl = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 'http://localhost:3000';

    if (!clientId) {
        console.warn("Spotify Client ID not found. Using Mock Mode.");
        return null;
    }

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code", // Authorization Code Flow
        redirect_uri: redirectUri,
        scope: SCOPES.join(" "),
        show_dialog: "true",
    });

    return `${SPOTIFY_AUTH_ENDPOINT}?${params.toString()}`;
};

export const getMockTracks = async (): Promise<SpotifyTrack[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_TRACKS), 1500); // Simulate network delay
    });
};

export const fetchTopTracks = async (token: string): Promise<SpotifyTrack[]> => {
    try {
        const res = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const errorBody = await res.text();
            console.error(`Spotify API Error (${res.status}):`, errorBody);
            throw new Error(`Spotify API Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data.items as SpotifyTrack[];
    } catch (error) {
        console.error("Failed to fetch top tracks:", error);
        throw error; // Re-throw to be caught by the caller
    }
};
