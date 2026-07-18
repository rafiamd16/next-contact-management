import { requireAdmin } from '@/lib/auth-util'

const AdminDashboard = async () => {
  await requireAdmin()

  return (
    <div className='container px-4 mx-auto'>
      <h1 className='text-2xl font-bold'>Admin Dashboard</h1>
    </div>
  )
}

export default AdminDashboard
