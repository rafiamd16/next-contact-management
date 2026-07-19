'use server'

import { requireSession } from '@/lib/auth-util'
import { prisma } from '@/lib/prisma'
import type { UserDashboardStats } from '@/types/dashboard'

export const getUserDashboardStats = async (): Promise<UserDashboardStats> => {
  const session = await requireSession()

  const userId = session.user.id

  const now = new Date()

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  try {
    const [totalContacts, contactsThisMonth, totalAddresses, addressesThisMonth] =
      await Promise.all([
        prisma.contact.count({ where: { userId } }),

        prisma.contact.count({
          where: {
            userId,
            createdAt: { gte: startOfMonth },
          },
        }),

        prisma.address.count({
          where: {
            contact: { userId },
          },
        }),

        prisma.address.count({
          where: {
            createdAt: { gte: startOfMonth },
            contact: { userId },
          },
        }),
      ])
    return {
      totalContacts,
      contactsThisMonth,
      totalAddresses,
      addressesThisMonth,
    }
  } catch (error) {
    console.error('Error fetching user dashboard stats:', error)
    return {
      totalContacts: 0,
      contactsThisMonth: 0,
      totalAddresses: 0,
      addressesThisMonth: 0,
    }
  }
}
