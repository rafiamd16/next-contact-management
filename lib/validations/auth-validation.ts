import z from 'zod'

export const signInSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(
        /^(?!.*(\p{L})\1{2,})[\p{L}'’\-]+(?:\s[\p{L}'’\-]+)*$/u,
        'Names can only contain letters, spaces, hyphens, or apostrophes, and no letter can be repeated more than twice in a row.',
      ),
    email: z.email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(32, 'Password must be at most 32 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,64}$/,
        'Passwords must contain uppercase letters, lowercase letters, numbers, and symbols.',
      ),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(32, 'Password must be at most 32 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,64}$/,
        'Passwords must contain uppercase letters, lowercase letters, numbers, and symbols.',
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignInInputSchema = z.infer<typeof signInSchema>
export type SignUpInputSchema = z.infer<typeof signUpSchema>
