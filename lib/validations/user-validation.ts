import z from 'zod'

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  query: z.string().trim().optional(),
  sortBy: z.enum(['name', 'createdAt']).default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
  role: z.enum(['all', 'user', 'admin']).default('all'),
})

export type ListUsersInput = z.infer<typeof listUsersSchema>
