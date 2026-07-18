'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { signOutAction } from '@/lib/actions/auth-action'
import type { Session } from '@/lib/auth'
import Link from 'next/link'
import { Activity, useTransition } from 'react'
import { FaSignOutAlt } from 'react-icons/fa'

const Navbar = ({ session }: { session: Session | null }) => {
  const [isPending, startTransition] = useTransition()

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction()
    })
  }

  return (
    <header className='container px-4 mx-auto'>
      <nav className='flex justify-end items-center gap-6 py-4'>
        <Link href={'/'}>Home</Link>
        <Activity mode={!session ? 'visible' : 'hidden'}>
          <Button>
            <Link href={'/sign-in'}>Sign in</Link>
          </Button>
        </Activity>
        <Activity mode={session ? 'visible' : 'hidden'}>
          <Button>
            <Link href={'/dashboard'}>Dashboard</Link>
          </Button>
          <Button
            disabled={isPending}
            className={`${isPending ? 'pointer-events-none' : ''}`}
            onClick={handleSignOut}
            variant={'outline'}>
            {isPending ? <Spinner className='size-4' /> : <FaSignOutAlt />}
            Sign out
          </Button>
        </Activity>
      </nav>
    </header>
  )
}

export default Navbar
