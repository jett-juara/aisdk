export type PermissionDefinition = {
  id: string
  pageKey: string
  featureKey: string
  label: string
  description: string
}

export type PermissionTemplate = {
  id: string
  label: string
  description: string
  permissionIds: string[]
}

export type PermissionItem = {
  pageKey: string | null
  featureKey: string
  accessGranted: boolean
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    id: 'dashboard.overview',
    pageKey: 'dashboard',
    featureKey: 'overview',
    label: 'Akses Dashboard',
    description: 'Lihat ringkasan performa internal dan metrik utama.',
  },
  {
    id: 'profile.edit',
    pageKey: 'profile',
    featureKey: 'edit',
    label: 'Kelola Profil',
    description: 'Perbarui informasi akun pribadi.',
  },
  {
    id: 'users.manage',
    pageKey: 'users',
    featureKey: 'manage',
    label: 'Kelola Pengguna',
    description: 'Aktifkan, blokir, atau hapus akun user lain.',
  },
  {
    id: 'permissions.manage',
    pageKey: 'permissions',
    featureKey: 'manage',
    label: 'Kelola Izin',
    description: 'Atur template dan granular permission untuk tim.',
  },
  {
    id: 'invitations.manage',
    pageKey: 'invitations',
    featureKey: 'manage',
    label: 'Kelola Undangan Admin',
    description: 'Kirim undangan admin baru dan pantau statusnya.',
  },
  {
    id: 'analytics.view',
    pageKey: 'analytics',
    featureKey: 'view',
    label: 'Lihat Analitik',
    description: 'Pantau statistik dan laporan performa event.',
  },
]

export const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    id: 'basic',
    label: 'Basic Access',
    description: 'Cocok buat kontributor umum. Hanya akses dashboard dan profil.',
    permissionIds: ['dashboard.overview', 'profile.edit'],
  },
  {
    id: 'manager',
    label: 'Event Manager',
    description: 'Ditujukan buat PIC event. Tambah kemampuan lihat analitik.',
    permissionIds: ['dashboard.overview', 'profile.edit', 'analytics.view'],
  },
  {
    id: 'admin',
    label: 'Admin Penuh',
    description: 'Lengkap dengan kontrol user dan permission.',
    permissionIds: [
      'dashboard.overview',
      'profile.edit',
      'analytics.view',
      'users.manage',
      'permissions.manage',
      'invitations.manage',
    ],
  },
]

export function resolveTemplatePermissions(templateId: string): PermissionItem[] {
  const template = PERMISSION_TEMPLATES.find((entry) => entry.id === templateId)
  if (!template) return []
  return template.permissionIds
    .map((permissionId) => PERMISSION_DEFINITIONS.find((definition) => definition.id === permissionId))
    .filter((definition): definition is PermissionDefinition => Boolean(definition))
    .map((definition) => ({
      pageKey: definition.pageKey,
      featureKey: definition.featureKey,
      accessGranted: true,
    }))
}

export function definitionToPermissionItem(
  definition: PermissionDefinition,
  accessGranted: boolean
): PermissionItem {
  return {
    pageKey: definition.pageKey,
    featureKey: definition.featureKey,
    accessGranted,
  }
}
