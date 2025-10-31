export function toIndonesianError(message: string) {
  const m = message.toLowerCase()
  if (m.includes('invalid login') || m.includes('invalid credentials')) return 'Email atau password salah.'
  if (m.includes('email already registered') || m.includes('duplicate key') || m.includes('already exists')) return 'Email sudah terdaftar.'
  if (m.includes('rate limit')) return 'Terlalu banyak permintaan. Coba lagi nanti.'
  if (m.includes('locked')) return 'Akun kamu terkunci sementara karena terlalu banyak percobaan gagal.'
  return 'Terjadi kesalahan. Coba lagi.'
}

