import { createBrowserClient } from '@supabase/ssr'
import { createClient as createServerClientBase } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Create a Supabase client for use in the browser.
 * Uses the NEXT_PUBLIC_ env vars.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Create a Supabase client for server-side use.
 * Uses the NEXT_PUBLIC_ env vars (anon key for RLS-safe queries).
 * For service-role operations, use SUPABASE_SERVICE_ROLE_KEY instead.
 */
export function createServerSupabaseClient() {
  return createServerClientBase<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type { Database }
