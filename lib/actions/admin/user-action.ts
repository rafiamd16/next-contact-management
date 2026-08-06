'use server'

import type { Prisma } from '@/generated/prisma/client'
import { requireAdmin } from '@/lib/auth-util'
import { prisma } from '@/lib/prisma'
import { userListSelect, type UserListItem } from '@/lib/selects/user-select'
import { listUsersSchema, type ListUsersInput } from '@/lib/validations/user-validation'
import type { ActionResponse } from '@/types/action-response'
import type { PaginatedResult } from '@/types/pagination'

export const getUsers = async (
  params: ListUsersInput,
): Promise<ActionResponse<PaginatedResult<UserListItem>>> => {
  await requireAdmin()

  const parsed = listUsersSchema.safeParse(params)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  const { page, limit, query, sortBy, sortDirection, role } = parsed.data
  const where: Prisma.UserWhereInput = {
    ...(query && {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    }),
    ...(role !== 'all' && { role }),
  }

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userListSelect,
        orderBy: { [sortBy]: sortDirection },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return {
      success: true,
      data: {
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    }
  } catch (error) {
    console.error('GetUsers error', error)
    return { success: false, error: 'Gagal mengambil data user' }
  }
}
