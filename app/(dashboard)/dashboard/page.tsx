import { requireSession } from '@/lib/auth-util'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
}

const DashboardPage = async () => {
  const { user } = await requireSession()

  return (
    <div>
      <div className='container px-4 mx-auto'>
        <h1 className='text-2xl font-bold'>Dashboard Page</h1>
        <p>Hello {user.name}, Welcome back</p>
      </div>
    </div>
  )
}

export default DashboardPage
