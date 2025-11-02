import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

describe('Admin Invitation API', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2025-11-02T07:00:00.000Z'))
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.test'
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  test('POST /api/admin/invitations creates invitation with metadata and audit log', async () => {
    const auditLogs: any[] = []
    const userUpserts: any[] = []
    let insertedInvitation: any = null

    const mockServer = {
      auth: {
        getUser: async () => ({ data: { user: { id: 'super-1', email: 'super@juara.co.id' } } }),
      },
      from: vi.fn(() => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: {
                id: 'super-1',
                role: 'superadmin',
                first_name: 'Erik',
                last_name: 'Supit',
                email: 'super@juara.co.id',
              },
            }),
          }),
        }),
      })),
    }

    const inviteUserByEmailMock = vi.fn(async () => ({
      data: {
        user: { id: 'invited-1' },
        action_link: 'https://app.test/auth/confirm?token=token-123&type=invite',
      },
      error: null,
    }))

    const adminFromMock = vi.fn((table: string) => {
      if (table === 'admin_invitations') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
          upsert: (payload: any) => {
            insertedInvitation = {
              ...payload,
              id: payload.id ?? 'invite-1',
              created_at: payload.created_at ?? new Date().toISOString(),
              updated_at: payload.updated_at ?? new Date().toISOString(),
            }
            return {
              select: () => ({
                single: async () => ({ data: insertedInvitation, error: null }),
              }),
            }
          },
        }
      }

      if (table === 'users') {
        return {
          upsert: async (payload: any) => {
            userUpserts.push(payload)
            return { error: null }
          },
        }
      }

      if (table === 'audit_logs') {
        return {
          insert: async (payload: any) => {
            auditLogs.push(payload)
            return { error: null }
          },
        }
      }

      throw new Error(`Unexpected table: ${table}`)
    })

    const mockAdmin = {
      auth: { admin: { inviteUserByEmail: inviteUserByEmailMock } },
      from: adminFromMock,
    }

    vi.doMock('@/lib/supabase/server', () => ({ createSupabaseServerClient: vi.fn(async () => mockServer) }))
    vi.doMock('@/lib/supabase/admin', () => ({ createSupabaseAdminClient: vi.fn(() => mockAdmin) }))

    const { POST } = await import('@/app/api/admin/invitations/route')
    const request = new Request('http://localhost/api/admin/invitations', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
        'user-agent': 'vitest',
      },
      body: JSON.stringify({
        email: 'new.admin@juara.co.id',
        firstName: 'New',
        lastName: 'Admin',
        role: 'admin',
        expiresInDays: 7,
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.invitation.email).toBe('new.admin@juara.co.id')
    expect(payload.invitation.metadata.deliveries).toHaveLength(1)
    expect(payload.invitation.metadata.deliveries[0].status).toBe('sent')
    expect(payload.invitation.metadata.subject).toContain('New Admin')

    expect(inviteUserByEmailMock).toHaveBeenCalledTimes(1)
    expect(userUpserts).toHaveLength(1)
    expect(userUpserts[0]).toMatchObject({
      email: 'new.admin@juara.co.id',
      invitation_token: 'token-123',
    })
    expect(auditLogs).toHaveLength(1)
    expect(insertedInvitation.status).toBe('sent')
  })

  test('POST /api/admin/invitations/[id]/resend resends invitation with new expiration', async () => {
    const auditLogs: any[] = []
    const userUpserts: any[] = []
    let updatedInvitation: any = null

    const mockServer = {
      auth: {
        getUser: async () => ({ data: { user: { id: 'super-1', email: 'super@juara.co.id' } } }),
      },
      from: vi.fn(() => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: {
                id: 'super-1',
                role: 'superadmin',
                first_name: 'Erik',
                last_name: 'Supit',
                email: 'super@juara.co.id',
              },
            }),
          }),
        }),
      })),
    }

    const inviteUserByEmailMock = vi.fn(async () => ({
      data: {
        user: { id: 'invited-1' },
        action_link: 'https://app.test/auth/confirm?token=token-new-456&type=invite',
      },
      error: null,
    }))

    const existingInvitation = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@juara.co.id',
      first_name: 'Test',
      last_name: 'Admin',
      role: 'admin',
      status: 'pending',
      metadata: {
        templateVersion: 'admin-invitation-v1',
        subject: 'Undangan Admin JUARA untuk Test Admin',
        previewText: 'Test invitation',
        expiresInDays: 7,
        inviter: { id: 'super-1', name: 'Erik Supit', email: 'super@juara.co.id' },
        deliveries: [{ provider: 'supabase_auth', sentAt: '2025-11-01T07:00:00.000Z', status: 'sent' }],
      },
      invited_user_id: 'invited-1',
      expires_at: '2025-11-01T07:00:00.000Z',
      sent_at: '2025-11-01T07:00:00.000Z',
      last_sent_at: '2025-11-01T07:00:00.000Z',
      responded_at: null,
      created_at: '2025-11-01T07:00:00.000Z',
      updated_at: '2025-11-01T07:00:00.000Z',
    }

    const adminFromMock = vi.fn((table: string) => {
      if (table === 'admin_invitations') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: existingInvitation, error: null }),
            }),
          }),
          update: (payload: any) => {
            updatedInvitation = {
              ...existingInvitation,
              ...payload,
              updated_at: new Date().toISOString(),
            }
            return {
              eq: () => ({
                select: () => ({
                  single: async () => ({ data: updatedInvitation, error: null }),
                }),
              }),
            }
          },
        }
      }

      if (table === 'users') {
        return {
          upsert: async (payload: any) => {
            userUpserts.push(payload)
            return { error: null }
          },
        }
      }

      if (table === 'audit_logs') {
        return {
          insert: async (payload: any) => {
            auditLogs.push(payload)
            return { error: null }
          },
        }
      }

      throw new Error(`Unexpected table: ${table}`)
    })

    const mockAdmin = {
      auth: { admin: { inviteUserByEmail: inviteUserByEmailMock } },
      from: adminFromMock,
    }

    vi.doMock('@/lib/supabase/server', () => ({ createSupabaseServerClient: vi.fn(async () => mockServer) }))
    vi.doMock('@/lib/supabase/admin', () => ({ createSupabaseAdminClient: vi.fn(() => mockAdmin) }))

    const { POST } = await import('@/app/api/admin/invitations/[id]/resend/route')
    const request = new Request('http://localhost/api/admin/invitations/550e8400-e29b-41d4-a716-446655440000/resend', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
        'user-agent': 'vitest',
      },
    })

    const response = await POST(request, { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) })
    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.invitation.email).toBe('admin@juara.co.id')
    expect(payload.invitation.metadata.deliveries).toHaveLength(2)
    expect(payload.invitation.metadata.deliveries[1].status).toBe('sent')

    expect(inviteUserByEmailMock).toHaveBeenCalledTimes(1)
    expect(userUpserts).toHaveLength(1)
    expect(auditLogs).toHaveLength(1)
    expect(auditLogs[0].action).toBe('admin_invitation.resent')
  })

  test('POST /api/admin/invitations/[id]/cancel cancels invitation and clears invite link', async () => {
    const auditLogs: any[] = []
    let updatedInvitation: any = null

    const mockServer = {
      auth: {
        getUser: async () => ({ data: { user: { id: 'super-1', email: 'super@juara.co.id' } } }),
      },
      from: vi.fn(() => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: {
                id: 'super-1',
                role: 'superadmin',
                first_name: 'Erik',
                last_name: 'Supit',
                email: 'super@juara.co.id',
              },
            }),
          }),
        }),
      })),
    }

    const existingInvitation = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'admin@juara.co.id',
      first_name: 'Test',
      last_name: 'Admin',
      role: 'admin',
      status: 'pending',
      metadata: {
        templateVersion: 'admin-invitation-v1',
        subject: 'Undangan Admin JUARA untuk Test Admin',
        previewText: 'Test invitation',
        expiresInDays: 7,
        inviter: { id: 'super-1', name: 'Erik Supit', email: 'super@juara.co.id' },
        deliveries: [{ provider: 'supabase_auth', sentAt: '2025-11-01T07:00:00.000Z', status: 'sent' }],
      },
      invited_user_id: 'invited-1',
      expires_at: '2025-11-10T07:00:00.000Z',
      sent_at: '2025-11-01T07:00:00.000Z',
      last_sent_at: '2025-11-01T07:00:00.000Z',
      responded_at: null,
      created_at: '2025-11-01T07:00:00.000Z',
      updated_at: '2025-11-01T07:00:00.000Z',
    }

    const userUpdates: any[] = []

    const adminFromMock = vi.fn((table: string) => {
      if (table === 'admin_invitations') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: existingInvitation, error: null }),
            }),
          }),
          update: (payload: any) => {
            updatedInvitation = {
              ...existingInvitation,
              ...payload,
              updated_at: new Date().toISOString(),
            }
            return {
              eq: () => ({
                select: () => ({
                  single: async () => ({ data: updatedInvitation, error: null }),
                }),
              }),
            }
          },
        }
      }

      if (table === 'users') {
        return {
          update: (payload: any) => {
            userUpdates.push(payload)
            return {
              eq: async () => ({ error: null })
            }
          },
        }
      }

      if (table === 'audit_logs') {
        return {
          insert: async (payload: any) => {
            auditLogs.push(payload)
            return { error: null }
          },
        }
      }

      throw new Error(`Unexpected table: ${table}`)
    })

    const mockAdmin = {
      from: adminFromMock,
    }

    vi.doMock('@/lib/supabase/server', () => ({ createSupabaseServerClient: vi.fn(async () => mockServer) }))
    vi.doMock('@/lib/supabase/admin', () => ({ createSupabaseAdminClient: vi.fn(() => mockAdmin) }))

    const { POST } = await import('@/app/api/admin/invitations/[id]/cancel/route')
    const request = new Request('http://localhost/api/admin/invitations/550e8400-e29b-41d4-a716-446655440001/cancel', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
        'user-agent': 'vitest',
      },
    })

    const response = await POST(request, { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440001' }) })
    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.invitation.status).toBe('cancelled')
    expect(payload.invitation.invite_link).toBe(null)
    expect(payload.invitation.responded_at).toBeTruthy()

    expect(userUpdates).toHaveLength(1)
    expect(userUpdates[0]).toMatchObject({
      invitation_token: null,
      invitation_expires_at: null,
    })
    expect(auditLogs).toHaveLength(1)
    expect(auditLogs[0].action).toBe('admin_invitation.cancelled')
  })

  test('POST /api/admin/invitations/accept finalizes invitation for authenticated user', async () => {
    const auditLogs: any[] = []
    const invitationUpdates: any[] = []
    const userUpdates: any[] = []

    const mockServer = {
      auth: {
        getUser: async () => ({
          data: { user: { id: 'invited-1', email: 'admin@juara.co.id' } }
        }),
      },
    }

    const existingInvitation = {
      id: 'invite-1',
      role: 'admin',
      status: 'sent',
      metadata: {
        templateVersion: 'admin-invitation-v1',
        subject: 'Undangan Admin JUARA',
        previewText: 'Test invitation',
        expiresInDays: 7,
        inviter: { id: 'super-1', name: 'Erik Supit', email: 'super@juara.co.id' },
        deliveries: [{ provider: 'supabase_auth', sentAt: '2025-11-01T07:00:00.000Z', status: 'sent' }],
      },
      invited_user_id: 'invited-1',
      email: 'admin@juara.co.id',
    }

    const adminFromMock = vi.fn((table: string) => {
      if (table === 'admin_invitations') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({
                  maybeSingle: async () => ({ data: existingInvitation, error: null }),
                }),
              }),
            }),
          }),
          update: (payload: any) => {
            invitationUpdates.push(payload)
            return {
              eq: async () => ({ error: null })
            }
          },
        }
      }

      if (table === 'users') {
        return {
          update: (payload: any) => {
            userUpdates.push(payload)
            return {
              eq: async () => ({ error: null })
            }
          },
        }
      }

      if (table === 'audit_logs') {
        return {
          insert: async (payload: any) => {
            auditLogs.push(payload)
            return { error: null }
          },
        }
      }

      throw new Error(`Unexpected table: ${table}`)
    })

    const mockAdmin = {
      from: adminFromMock,
    }

    vi.doMock('@/lib/supabase/server', () => ({ createSupabaseServerClient: vi.fn(async () => mockServer) }))
    vi.doMock('@/lib/supabase/admin', () => ({ createSupabaseAdminClient: vi.fn(() => mockAdmin) }))

    const { POST } = await import('@/app/api/admin/invitations/accept/route')
    const request = new Request('http://localhost/api/admin/invitations/accept', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
        'user-agent': 'vitest',
      },
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.success).toBe(true)

    expect(invitationUpdates).toHaveLength(1)
    expect(invitationUpdates[0]).toMatchObject({
      status: 'accepted',
      invited_user_id: 'invited-1',
    })

    expect(userUpdates).toHaveLength(1)
    expect(userUpdates[0]).toMatchObject({
      role: 'admin',
      invitation_token: null,
      invitation_expires_at: null,
    })

    expect(auditLogs).toHaveLength(1)
    expect(auditLogs[0].action).toBe('admin_invitation.accepted')
  })
})
