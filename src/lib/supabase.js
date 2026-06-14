import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Network Validation Guard: Alert your terminal if your laptop keys are misconfigured
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Infrastructure Exception: Supabase connection credentials are missing inside your local .env.local configuration file.'
  );
}

// Initialize and export the secure data connection client tunnel
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
