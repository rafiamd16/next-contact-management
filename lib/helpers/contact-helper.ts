import { prisma } from '@/lib/prisma'
import { contactWithUserInclude } from '@/lib/selects/contact-select'
import 'server-only'

export const findContactById = (contactId: string) => {
  return prisma.contact.findUnique({
    where: { id: contactId },
    include: contactWithUserInclude,
  })
}

export const findOwnedContactById = (contactId: string, userId: string) => {
  return prisma.contact.findFirst({
    where: { id: contactId, userId },
    include: contactWithUserInclude,
  })
}
