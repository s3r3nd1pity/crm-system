import { PasswordSetupComponent } from '@/components/auth/PasswordSetupComponent'

export default async function Page({ params }: { params: Promise<{ type: string; token: string }> }) {
  const { type, token } = await params

  return <PasswordSetupComponent type={type} token={token} />
}