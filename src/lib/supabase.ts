import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('pfa_supabase_url');
    const localKey = localStorage.getItem('pfa_supabase_key');
    if (localUrl && localKey) {
      return { url: localUrl, anonKey: localKey };
    }
  }

  return { url: envUrl, anonKey: envKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('https://'));
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) return null;

  if (!cachedClient) {
    cachedClient = createClient(url, anonKey, {
      auth: { persistSession: true },
    });
  }
  return cachedClient;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const tempClient = createClient(url, anonKey);
    const { error } = await tempClient.from('categories').select('id').limit(1);
    if (error && !error.message.includes('relation "categories" does not exist')) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Connection failed' };
  }
}
