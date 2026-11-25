import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (
      isNewSupabaseApiKey(supabaseKey) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

let cachedClient: SupabaseClient<Database> | undefined;

/**
 * Returns a server-only Supabase admin client using the service role key.
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (cachedClient) return cachedClient;

  const config = useRuntimeConfig();
  const supabaseUrl = config.supabaseUrl || process.env.SUPABASE_URL;
  const supabaseServiceRoleKey =
    config.supabaseServiceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    const missing = [
      ...(!supabaseUrl ? ["SUPABASE_URL"] : []),
      ...(!supabaseServiceRoleKey ? ["SUPABASE_SERVICE_ROLE_KEY"] : []),
    ];
    throw createError({
      statusCode: 500,
      statusMessage: `Missing Supabase environment variable(s): ${missing.join(", ")}.`,
    });
  }

  cachedClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    global: {
      fetch: createSupabaseFetch(supabaseServiceRoleKey),
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
