'use server'

import type { Prisma } from '@/generated/prisma/client'
import { requireAdmin } from '@/lib/auth-util'
import { prisma } from '@/lib/prisma'
import { listUsersSchema, type ListUsersInput } from '@/lib/validations/user-validation'

const userListSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  role: true,
  banned: true,
  banReason: true,
  banExpires: true,
  createdAt: true,
} satisfies Prisma.UserSelect

type SafeUser = Prisma.UserGetPayload<{ select: typeof userListSelect }>

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type ListUsersResult =
  | { success: true; data: { users: SafeUser[]; pagination: Pagination } }
  | { success: false; error: string }

export const listUserAction = async (input: ListUsersInput): Promise<ListUsersResult> => {
  await requireAdmin()

  const parsed = listUsersSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { page, limit, searchValue, sortBy, sortDirection } = parsed.data
  const offset = (page - 1) * limit

  try {
    const where: Prisma.UserWhereInput = searchValue
      ? {
          OR: [
            { name: { contains: searchValue, mode: 'insensitive' } },
            { email: { contains: searchValue, mode: 'insensitive' } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userListSelect,
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortDirection },
      }),
      prisma.user.count({ where }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / limit))

    return {
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    }
  } catch (error) {
    console.error('[listUsersAction]', error)
    return { success: false, error: 'Gagal mengambil data user' }
  }
}
