import { prisma } from '@/lib/prisma'
import 'server-only'

export const checkIsAdmin = (role: string | null | undefined): boolean => role === 'admin'

export const verifyContactOwnership = async (contactId: string, userId: string): Promise<void> => {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { userId: true },
  })

  if (!contact || contact.userId !== userId) {
    throw new Error('Contact not found')
  }
}

export const verifyAddressOwnership = async (addressId: string, userId: string): Promise<void> => {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
    include: {
      contact: {
        select: { userId: true },
      },
    },
  })

  if (!address || address.contact.userId !== userId) {
    throw new Error('Address not found')
  }
}
