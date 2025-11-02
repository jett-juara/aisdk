export type InvitationDeliveryStatus = 'sent' | 'error' | 'cancelled' | 'accepted'

export type InvitationDeliveryEntry = {
  provider: 'supabase_auth'
  sentAt: string
  status: InvitationDeliveryStatus
  errorMessage?: string
}

export type InvitationMetadata = {
  templateVersion: string
  subject: string
  previewText: string
  expiresInDays: number
  inviter: {
    id: string
    name: string | null
    email: string | null
  }
  deliveries: InvitationDeliveryEntry[]
}
