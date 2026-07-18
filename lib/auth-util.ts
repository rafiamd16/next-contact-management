import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import 'server-only'

export const getSession = async () => {
  return auth.api.getSession({
    headers: await headers(),
  })
}

export const requireSession = async () => {
  const session = await getSession()
  if (!session) redirect('/sign-in')
  return session
}

export const requireAdmin = async () => {
  const session = await requireSession()
  if (session.user.role !== 'admin') redirect('/dashboard')
  return session
}
