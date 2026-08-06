import type { Prisma } from '@/generated/prisma/client'

export const contactWithUserInclude = {
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ContactInclude

export type ContactWithUser = Prisma.ContactGetPayload<{
  include: typeof contactWithUserInclude
}>
