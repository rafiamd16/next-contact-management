import SignUpForm from '@/components/auth/sign-up-form'
import ContainerAnimate from '@/components/container-animate'
import { getSession } from '@/lib/auth-util'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Sign Up',
}

const SignUpPage = async () => {
  const session = await getSession()
  if (session) {
    redirect('/dashboard')
  }

  return (
    <ContainerAnimate>
      <div className='flex flex-col gap-6'>
        <h1 className='text-2xl sm:text-3xl font-bold'>Sign Up</h1>
        <SignUpForm />
      </div>
    </ContainerAnimate>
  )
}

export default SignUpPage
