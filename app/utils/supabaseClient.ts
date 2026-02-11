import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mock client for build time or missing credentials
const createMockClient = () => {
    console.warn("⚠️ Supabase Credentials Missing. Soul Compass features will be disabled.");
    return {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        },
        from: () => ({
            select: () => ({ data: [], error: null }),
            insert: () => ({ data: [], error: null }),
            upsert: () => ({ data: [], error: null }),
        }),
    } as any;
};

export const supabase = (SUPABASE_URL && SUPABASE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : createMockClient();
