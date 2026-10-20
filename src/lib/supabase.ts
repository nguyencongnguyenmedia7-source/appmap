import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env, isSupabaseConfigured } from './env';

const fallbackUrl = 'https://placeholder-cityverse.supabase.co';
const fallbackKey = 'placeholder-key';

export const supabase = createClient(
  isSupabaseConfigured ? env.SUPABASE_URL : fallbackUrl,
  isSupabaseConfigured ? env.SUPABASE_ANON_KEY : fallbackKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
