import type { Prisma } from '@/generated/prisma/client'

export const userListSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  image: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect

export type UserListItem = Prisma.UserGetPayload<{
  select: typeof userListSelect
}>
