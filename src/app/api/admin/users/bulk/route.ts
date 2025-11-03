import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSuperadminContext } from '../../invitations/utils'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const bulkOperationSchema = z.object({
  operation: z.enum(['status_change', 'permission_assign', 'delete']),
  userIds: z.array(z.string().uuid()).min(1).max(100, 'Maximum 100 users per operation'),
  data: z.object({
    status: z.enum(['active', 'blocked', 'deleted']).optional(),
    reason: z.string().max(200, 'Alasan maksimal 200 karakter').optional(),
    permissions: z.array(z.object({
      pageKey: z.string().nullable().optional(),
      featureKey: z.string().min(1, 'featureKey wajib diisi'),
      accessGranted: z.boolean(),
    })).optional(),
    template: z.string().optional(),
  }),
  metadata: z.object({
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
  }).optional(),
})

export async function POST(request: Request) {
  const server = await createSupabaseServerClient()
  const admin = createSupabaseAdminClient()

  const contextResult = await getSuperadminContext(server)
  if ('error' in contextResult) {
    return NextResponse.json({ error: { message: contextResult.error.message } }, { status: contextResult.error.status })
  }

  const { profile } = contextResult.data

  const body = await request.json().catch(() => null)
  const parsed = bulkOperationSchema.safeParse(body)

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(', ')
    return NextResponse.json({ error: { message } }, { status: 400 })
  }

  const { operation, userIds, data, metadata } = parsed.data

  // Verify all users exist and can be modified
  const { data: existingUsers, error: fetchError } = await admin
    .from('users')
    .select('id, email, role, status, first_name, last_name')
    .in('id', userIds)

  if (fetchError) {
    return NextResponse.json({ error: { message: 'Gagal mengambil data user' } }, { status: 400 })
  }

  if (existingUsers.length !== userIds.length) {
    return NextResponse.json({ error: { message: 'Beberapa user tidak ditemukan' } }, { status: 404 })
  }

  // Check permissions for operation
  const canModify = existingUsers.every(user => {
    // Can't modify users with equal or higher role
    if (user.role === 'superadmin' && profile.role !== 'superadmin') return false
    if (user.role === 'admin' && !['superadmin', 'admin'].includes(profile.role)) return false
    return true
  })

  if (!canModify) {
    return NextResponse.json({ error: { message: 'Tidak punya akses untuk memodifikasi beberapa user' } }, { status: 403 })
  }

  try {
    let results: any[] = []

    switch (operation) {
      case 'status_change':
        results = await handleBulkStatusChange(admin, existingUsers, data, profile, metadata)
        break
      case 'permission_assign':
        results = await handleBulkPermissionAssign(admin, existingUsers, data, profile, metadata)
        break
      case 'delete':
        results = await handleBulkDelete(admin, existingUsers, data, profile, metadata)
        break
      default:
        return NextResponse.json({ error: { message: 'Operasi tidak valid' } }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      operation,
      results,
      summary: {
        total: userIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    })
  } catch (_error) {
    return NextResponse.json(
      { error: { message: 'Operasi bulk gagal' } },
      { status: 500 }
    )
  }
}

async function handleBulkStatusChange(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  users: any[],
  data: any,
  operator: any,
  metadata?: any
) {
  const results = []
  const now = new Date().toISOString()

  for (const user of users) {
    try {
      // Skip if status is the same
      if (user.status === data.status) {
        results.push({ userId: user.id, success: true, skipped: true, reason: 'Status already the same' })
        continue
      }

      // Update user status
      const { error: updateError } = await admin
        .from('users')
        .update({
          status: data.status,
          deleted_at: data.status === 'deleted' ? now : null,
        })
        .eq('id', user.id)

      if (updateError) {
        results.push({ userId: user.id, success: false, error: updateError.message })
        continue
      }

      // Record audit log
      await admin.from('audit_logs').insert({
        user_id: operator.id,
        action: 'user.bulk_status_change',
        resource_type: 'user',
        resource_id: user.id,
        old_values: { status: user.status },
        new_values: { status: data.status, reason: data.reason },
        ip_address: metadata?.ipAddress,
        user_agent: metadata?.userAgent,
        metadata: {
          bulkOperation: true,
          operatorRole: operator.role,
        },
      })

      results.push({ userId: user.id, success: true, oldStatus: user.status, newStatus: data.status })
    } catch (error) {
      results.push({ userId: user.id, success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  return results
}

async function handleBulkPermissionAssign(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  users: any[],
  data: any,
  operator: any,
  metadata?: any
) {
  const results = []
  const now = new Date().toISOString()

  // Resolve permissions from template or direct assignment
  let permissionsToAssign = data.permissions

  if (data.template && data.template !== 'custom') {
    // Import permission template logic
    const { PERMISSION_TEMPLATES, PERMISSION_DEFINITIONS } = await import('@/lib/dashboard/permissions')
    const template = PERMISSION_TEMPLATES.find(t => t.id === data.template)
    if (template) {
      // Convert template permissionIds to full permission objects
      permissionsToAssign = template.permissionIds.map(permId => {
        const permissionDef = PERMISSION_DEFINITIONS.find(p => p.id === permId)
        if (permissionDef) {
          return {
            pageKey: permissionDef.pageKey,
            featureKey: permissionDef.featureKey,
            accessGranted: true
          }
        }
        return null
      }).filter(Boolean)
    }
  }

  if (!permissionsToAssign || permissionsToAssign.length === 0) {
    return users.map(user => ({
      userId: user.id,
      success: false,
      error: 'No permissions to assign',
    }))
  }

  for (const user of users) {
    try {
      // Delete existing permissions for the user
      await admin.from('user_permissions').delete().eq('user_id', user.id)

      // Insert new permissions
      const permissionsToInsert = permissionsToAssign.map((permission: any) => ({
        user_id: user.id,
        page_key: permission.pageKey,
        feature_key: permission.featureKey,
        access_granted: permission.accessGranted,
        created_at: now,
        updated_at: now,
      }))

      const { error: insertError } = await admin
        .from('user_permissions')
        .upsert(permissionsToInsert)

      if (insertError) {
        results.push({ userId: user.id, success: false, error: insertError.message })
        continue
      }

      // Record audit log
      await admin.from('audit_logs').insert({
        user_id: operator.id,
        action: 'user.bulk_permission_assign',
        resource_type: 'user_permissions',
        resource_id: user.id,
        new_values: {
          permissionsCount: permissionsToInsert.length,
          template: data.template,
        },
        ip_address: metadata?.ipAddress,
        user_agent: metadata?.userAgent,
        metadata: {
          bulkOperation: true,
          operatorRole: operator.role,
          permissions: permissionsToInsert,
        },
      })

      results.push({
        userId: user.id,
        success: true,
        permissionsAssigned: permissionsToInsert.length,
      })
    } catch (error) {
      results.push({ userId: user.id, success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  return results
}

async function handleBulkDelete(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  users: any[],
  data: any,
  operator: any,
  metadata?: any
) {
  const results = []
  const now = new Date().toISOString()

  for (const user of users) {
    try {
      // Can't delete users with equal or higher role
      if (user.role === 'superadmin' || (user.role === 'admin' && operator.role !== 'superadmin')) {
        results.push({
          userId: user.id,
          success: false,
          error: 'Cannot delete user with equal or higher role',
        })
        continue
      }

      // Update user status to deleted
      const { error: updateError } = await admin
        .from('users')
        .update({
          status: 'deleted',
          deleted_at: now,
        })
        .eq('id', user.id)

      if (updateError) {
        results.push({ userId: user.id, success: false, error: updateError.message })
        continue
      }

      // Delete user permissions
      await admin.from('user_permissions').delete().eq('user_id', user.id)

      // Record audit log
      await admin.from('audit_logs').insert({
        user_id: operator.id,
        action: 'user.bulk_delete',
        resource_type: 'user',
        resource_id: user.id,
        old_values: { status: user.status, role: user.role },
        new_values: { status: 'deleted', deleted_at: now },
        ip_address: metadata?.ipAddress,
        user_agent: metadata?.userAgent,
        metadata: {
          bulkOperation: true,
          operatorRole: operator.role,
          reason: data.reason,
        },
      })

      results.push({
        userId: user.id,
        success: true,
        deletedStatus: user.status,
        deletedRole: user.role,
      })
    } catch (error) {
      results.push({ userId: user.id, success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  return results
}