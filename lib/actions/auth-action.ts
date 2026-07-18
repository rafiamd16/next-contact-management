'use server'

import { auth } from '@/lib/auth'
import {
  signInSchema,
  signUpSchema,
  type SignInInputSchema,
  type SignUpInputSchema,
} from '@/lib/validations/auth-validation'
import { APIError } from 'better-auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const signUpAction = async (data: SignUpInputSchema) => {
  const validated = signUpSchema.safeParse(data)

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  try {
    await auth.api.signUpEmail({
      body: {
        name: validated.data.name,
        email: validated.data.email,
        password: validated.data.password,
      },
      headers: await headers(),
    })
  } catch (error) {
    if (error instanceof APIError) {
      return { error: error.body?.message ?? 'Sign up failed. Please try again!' }
    }
    console.error('Sign up failed:', error)
    return { error: 'Something went wrong. Please try again.' }
  }

  redirect('/dashboard')
}

export const signInAction = async (data: SignInInputSchema) => {
  const validated = signInSchema.safeParse(data)

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  try {
    await auth.api.signInEmail({
      body: {
        email: validated.data.email,
        password: validated.data.password,
      },
      headers: await headers(),
    })
  } catch (error) {
    if (error instanceof APIError) {
      return { error: error.body?.message ?? 'Sign in failed. Please try again!' }
    }
    console.error('Sign up failed:', error)
    return { error: 'Something went wrong. Please try again!' }
  }

  redirect('/dashboard')
}

export const signInSocialAction = async (provider: 'github' | 'google') => {
  const { url } = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL: '/dashboard',
    },
  })

  if (!url) {
    return { error: 'Sign in failed. Please try again.' }
  }

  redirect(url)
}

export const signOutAction = async () => {
  try {
    await auth.api.signOut({ headers: await headers() })
  } catch (error) {
    if (error instanceof APIError) {
      console.error('Sign out failed:', error.body?.message)
      return
    }
    console.error('Sign out failed:', error)
  }
  redirect('/sign-in')
}
