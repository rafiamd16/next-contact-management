import Navbar from '@/components/navbar'
import { getSession } from '@/lib/auth-util'

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession()

  return (
    <main>
      <Navbar session={session} />
      {children}
    </main>
  )
}

export default MainLayout
