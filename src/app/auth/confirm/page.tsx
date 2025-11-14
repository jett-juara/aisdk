import ConfirmView from '@/components/auth/confirm/confirm-view'
import InvitationEffect from '@/components/auth/confirm/invitation-effect'

export default async function ConfirmPage({
  searchParams
}: {
  searchParams?: { invited?: string } | Promise<{ invited?: string }>
} = {}) {
  const title = "Email terverifikasi"
  const subtitle = "Akun Anda sudah aktif. Silakan login."

  const resolvedParams = await Promise.resolve(searchParams)
  const invited = Boolean(resolvedParams?.invited)

  return (
    <>
      <InvitationEffect invited={invited} />
      <ConfirmView title={title} subtitle={subtitle} />
    </>
  )
}