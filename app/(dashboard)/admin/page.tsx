import { requireAdmin } from '@/lib/auth-util'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
}

const AdminDashboard = async () => {
  const { user } = await requireAdmin()

  return (
    <div className='container px-4 mx-auto'>
      <h1 className='text-2xl font-bold'>Admin Dashboard Page</h1>
      <p>Hello {user.name}, Welcome back</p>
      <p>Role: {user.role}</p>
    </div>
  )
}

export default AdminDashboard
