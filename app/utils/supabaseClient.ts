import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://goprayxguenueyfsfbvo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_N0oTW-6AULg7CF0-a6UoYQ_PqV4WOAr';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
