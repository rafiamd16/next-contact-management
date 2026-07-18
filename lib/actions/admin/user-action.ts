'use server'

import type { Prisma } from '@/generated/prisma/client'
import { requireAdmin } from '@/lib/auth-util'
import { prisma } from '@/lib/prisma'
import { listUsersSchema, type ListUsersInput } from '@/lib/validations/user-validation'

export const listUserAction = async (input: ListUsersInput) => {
  await requireAdmin()

  const parsed = listUsersSchema.safeParse(input)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { page, limit, searchValue, sortBy, sortDirection } = parsed.data
  const offset = (page - 1) * limit

  try {
    const where: Prisma.UserWhereInput = searchValue
      ? {
          OR: [
            {
              name: {
                contains: searchValue,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: searchValue,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {}

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: {
          [sortBy]: sortDirection,
        },
      }),
      prisma.user.count({
        where,
      }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      success: true as const,
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

    return {
      success: false as const,
      error: 'Gagal mengambil data user',
    }
  }
}
