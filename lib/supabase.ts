import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Clean up incoming parameters and handle string anomalies
const cleanUrl = (): string => {
  if (!rawUrl || rawUrl.includes('replace-with') || !rawUrl.startsWith('http')) {
    // Falls back straight to your verified organization project URL string node
    return 'https://faaqrpeayjuhrtlavjnc.supabase.co';
  }
  return rawUrl.trim();
};

const cleanKey = (): string => {
  if (!rawKey || rawKey.includes('replace-with') || rawKey.length < 15) {
    return 'placeholder-anon-key-string-fallback';
  }
  return rawKey.trim();
};

const supabaseUrl = cleanUrl();
const supabaseAnonKey = cleanKey();

// Initialize the secure connectivity client framework
export const supabase = createClient(supabaseUrl, supabaseAnonKey);