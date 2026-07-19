import z from 'zod'

export const listUsersSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  searchValue: z.string().trim().optional(),
  sortBy: z.enum(['name', 'email', 'role', 'createdAt', 'updatedAt']).default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
})

export type ListUsersInput = z.infer<typeof listUsersSchema>
