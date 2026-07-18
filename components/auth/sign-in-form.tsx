'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { signInAction, signInSocialAction } from '@/lib/actions/auth-action'
import { signInSchema, type SignInInputSchema } from '@/lib/validations/auth-validation'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Activity, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FaGithub, FaGoogle, FaSignInAlt } from 'react-icons/fa'
import { IoEye, IoEyeOff, IoLockClosed, IoMail } from 'react-icons/io5'

const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isPendingGithub, startTransitionGithub] = useTransition()
  const [isPendingGoogle, startTransitionGoogle] = useTransition()

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev)
  }

  const form = useForm<SignInInputSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { control, handleSubmit } = form

  const onSubmit = (values: SignInInputSchema) => {
    setGlobalError(null)

    startTransition(async () => {
      const res = await signInAction(values)
      if (res?.error) {
        setGlobalError(res.error)
      }
    })
  }

  const handleOAuth = (provider: 'github' | 'google') => {
    setGlobalError(null)
    if (provider === 'github') {
      startTransitionGithub(async () => {
        const res = await signInSocialAction(provider)
        if (res?.error) {
          setGlobalError(`Error signing in with ${provider}: ${res.error}`)
        }
      })
      return
    }

    if (provider === 'google') {
      startTransitionGoogle(async () => {
        const res = await signInSocialAction(provider)
        if (res?.error) {
          setGlobalError(`Error signing in with ${provider}: ${res.error}`)
        }
      })
      return
    }
  }

  return (
    <div className='space-y-4 w-xs '>
      <Activity mode={globalError ? 'visible' : 'hidden'}>
        <Alert variant='destructive'>
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      </Activity>
      <form
        id='form-rhf-input'
        onSubmit={handleSubmit(onSubmit)}
        className={`space-y-7 ${isPending || isPendingGoogle || isPendingGithub ? 'pointer-events-none' : ''}`}>
        <FieldGroup>
          <Controller
            name='email'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='form-rhf-input-email'>Email</FieldLabel>
                <div className='relative'>
                  <IoMail className='absolute top-1/2 -translate-y-1/2 left-2.5' />
                  <Input
                    {...field}
                    id='form-rhf-input-email'
                    aria-invalid={fieldState.invalid}
                    placeholder='Email'
                    autoComplete='email'
                    className={`pl-8 ${isPending || isPendingGoogle || isPendingGithub ? 'pointer-events-none' : ''} `}
                  />
                </div>
                <Activity mode={fieldState.invalid ? 'visible' : 'hidden'}>
                  <FieldError errors={[fieldState.error]} />
                </Activity>
              </Field>
            )}
          />
          <Controller
            name='password'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='form-rhf-input-password'>Password</FieldLabel>
                <div className='relative'>
                  <IoLockClosed className='absolute top-1/2 -translate-y-1/2 left-2.5' />
                  <Input
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    id='form-rhf-input-password'
                    aria-invalid={fieldState.invalid}
                    placeholder='Password'
                    autoComplete='new-password'
                    className='px-8'
                  />
                  <div
                    onClick={handleTogglePassword}
                    className='absolute cursor-pointer right-2.5 top-1/2 -translate-y-1/2'>
                    {showPassword ? <IoEye /> : <IoEyeOff />}
                  </div>
                </div>
                <Activity mode={fieldState.invalid ? 'visible' : 'hidden'}>
                  <FieldError errors={[fieldState.error]} />
                </Activity>
              </Field>
            )}
          />
        </FieldGroup>
        <Button
          size={'lg'}
          type='submit'
          disabled={isPending || isPendingGoogle || isPendingGithub}
          className={`w-full ${isPending || isPendingGoogle || isPendingGithub ? 'pointer-events-none' : ''}`}>
          {isPending ? <Spinner className='size-4' /> : <FaSignInAlt />}
          {isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>Or continue with</span>
        </div>
      </div>

      <div
        className={`grid grid-cols-2 gap-4 ${isPending || isPendingGoogle || isPendingGithub ? 'pointer-events-none' : ''} `}>
        <Button
          onClick={() => handleOAuth('google')}
          disabled={isPending || isPendingGoogle || isPendingGithub}
          className={`${isPending || isPendingGoogle || isPendingGithub ? 'pointer-events-none' : ''}`}>
          {isPendingGoogle ? <Spinner className='size-4' /> : <FaGoogle />}
          {isPendingGoogle ? 'Signing in...' : 'Google'}
        </Button>
        <Button
          onClick={() => handleOAuth('github')}
          disabled={isPending || isPendingGoogle || isPendingGithub}
          className={`${isPendingGithub ? 'pointer-events-none' : ''}`}>
          {isPendingGithub ? <Spinner className='size-4' /> : <FaGithub />}
          {isPendingGithub ? 'Signing in...' : 'Github'}
        </Button>
      </div>

      <p className='text-center text-sm text-muted-foreground'>
        Don&apos;t have an account?{' '}
        <Link href='/sign-up' className='underline underline-offset-4 font-bold transition-all'>
          Sign up
        </Link>
      </p>
    </div>
  )
}

export default SignInForm
