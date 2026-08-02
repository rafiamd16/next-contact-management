import z from 'zod'

export const listContactsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  query: z.string().trim().optional(),
  sortBy: z.enum(['firstName', 'createdAt', 'updatedAt']).default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
  filter: z.enum(['all', 'my_contacts']).default('all'),
})

export const contactIdSchema = z.string().min(1, 'Contact id wajib diisi')

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().max(100).optional(),
  email: z.email('Invalid email').trim().or(z.literal('')).optional(),
  phone: z
    .string()
    .trim()
    .min(12, 'Phone number is too short')
    .max(13, 'Phone number is too long')
    .refine((v) => /^\+?[0-9\- ]{7,20}$/.test(v), 'Invalid phone number'),
})

export const updateContactSchema = contactSchema.partial()

export type ListContactsInput = z.infer<typeof listContactsSchema>
export type ContactInputSchema = z.infer<typeof contactSchema>
export type UpdateContactInputSchema = z.infer<typeof updateContactSchema>
