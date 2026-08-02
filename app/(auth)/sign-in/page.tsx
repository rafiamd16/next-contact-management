import SignInForm from '@/components/auth/sign-in-form'
import ContainerAnimate from '@/components/container-animate'
import { getSession } from '@/lib/auth-util'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Sign In',
}

const SignInPage = async () => {
  const session = await getSession()
  if (session) {
    redirect('/dashboard')
  }

  return (
    <ContainerAnimate>
      <div className='flex flex-col gap-7'>
        <h1 className='text-2xl sm:text-3xl font-bold'>Sign In</h1>
        <SignInForm />
      </div>
    </ContainerAnimate>
  )
}

export default SignInPage
