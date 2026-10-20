import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env, isSupabaseConfigured } from './env';

const fallbackUrl = 'https://fuwimehbldqvaookauvj.supabase.co';
const fallbackKey = 'sb_publishable_4r75VX_rR_N5S5c1cZhKLw_ypp8XsVb';

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
