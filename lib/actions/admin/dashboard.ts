'use server'

import { requireAdmin } from '@/lib/auth-util'
import { prisma } from '@/lib/prisma'
import type { AdminDashboardStats } from '@/types/dashboard'

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  await requireAdmin()

  try {
    const [totalUsers, verifiedUsers, activeSession, bannedUsers] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: { emailVerified: true },
      }),

      prisma.session.count({
        where: { expiresAt: { gt: new Date() } },
      }),

      prisma.user.count({
        where: { banned: true },
      }),
    ])

    return {
      totalUsers,
      verifiedUsers,
      activeSession,
      bannedUsers,
    }
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error)
    return {
      totalUsers: 0,
      verifiedUsers: 0,
      activeSession: 0,
      bannedUsers: 0,
    }
  }
}
