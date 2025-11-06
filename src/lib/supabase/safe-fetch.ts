const originalFetch = globalThis.fetch?.bind(globalThis)

if (!originalFetch) {
  throw new Error('Fetch global tidak tersedia di runtime ini')
}

type SupabaseFetch = typeof fetch

/**
 * Supabase sering melempar `TypeError: Failed to fetch` saat jaringan/offline.
 * Fungsi ini membungkus fetch asli supaya kita bisa mengembalikan respons 503
 * terkontrol sehingga Supabase menangkapnya sebagai error biasa, bukan exception.
 */
export const createSupabaseFetch = (label: string): SupabaseFetch => {
  return async (input, init) => {
    try {
      return await originalFetch(input, {
        ...init,
        cache: 'no-store',
      })
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return new Response(
          JSON.stringify({
            error: 'service_unavailable',
            message: 'Supabase sementara tidak bisa dijangkau',
          }),
          {
            status: 503,
            headers: {
              'Content-Type': 'application/json',
              'x-supabase-offline': '1',
            },
          },
        )
      }

      throw error
    }
  }
}
