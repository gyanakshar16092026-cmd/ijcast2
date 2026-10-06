import { createClient } from '@supabase/supabase-js';

// Vercel-compatible Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);