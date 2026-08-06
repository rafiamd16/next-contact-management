import { prisma } from '@/lib/prisma'
import 'server-only'

export const findAddressById = (addressId: string) => {
  return prisma.address.findUnique({
    where: { id: addressId },
  })
}

export const findOwnedAddressById = (addressId: string, userId: string) => {
  return prisma.address.findFirst({
    where: {
      id: addressId,
      contact: { userId },
    },
  })
}
