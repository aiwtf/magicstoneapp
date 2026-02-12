'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Music, AlertCircle } from 'lucide-react';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Processing...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setError(`Spotify Error: ${errorParam}`);
            setStatus('Connection Failed');
            return;
        }

        if (code) {
            exchangeCode(code);
        } else {
            setError('No authorization code returned');
            setStatus('Invalid Request');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const exchangeCode = async (code: string) => {
        setStatus('Exchanging Soul Frequency...');
        try {
            const res = await fetch('/api/auth/spotify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Token exchange failed');
            }

            // Save token
            // Note: In a production app, we should handle refresh tokens securely.
            // For this implementation, we just use the access token until it expires.
            localStorage.setItem('spotify_access_token', data.access_token);

            // Redirect home
            setStatus('Resonance Established. Returning...');
            setTimeout(() => {
                router.push('/');
            }, 1000);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            setStatus('Connection Failed');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-6">
                <div className="flex justify-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ring-1 ${error ? 'bg-red-500/10 ring-red-500/20' : 'bg-green-500/10 ring-green-500/20'}`}>
                        {error ? <AlertCircle className="w-8 h-8 text-red-500" /> : <Music className="w-8 h-8 text-green-500 animate-pulse" />}
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                        {error ? 'Connection Error' : 'Soul Link'}
                    </h2>
                    <p className={`text-sm ${error ? 'text-red-400' : 'text-zinc-400'}`}>
                        {error || status}
                    </p>
                </div>

                {error && (
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                        Return to Altar
                    </button>
                )}
            </div>
        </div>
    );
}

export default function CallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading...</div>}>
            <CallbackContent />
        </Suspense>
    );
}
