import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("⚠️ Supabase Credentials Missing. Soul Compass features will be disabled.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
