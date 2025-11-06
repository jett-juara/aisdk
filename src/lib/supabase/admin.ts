import { createServerClient } from '@supabase/ssr'
import { createSupabaseFetch } from '@/lib/supabase/safe-fetch'

const supabaseFetch = createSupabaseFetch('server-admin')

export function createSupabaseAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    {
      cookies: {
        get() {
          return undefined
        },
        set() {},
        remove() {},
      },
      global: {
        fetch: supabaseFetch,
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  )
}
