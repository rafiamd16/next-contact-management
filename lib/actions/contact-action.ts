'use server'

import { requireAuth } from '@/lib/auth-util'
import { prisma } from '@/lib/prisma'
import {
  ContactInputSchema,
  ListContactsInput,
  UpdateContactInputSchema,
  contactIdSchema,
  contactSchema,
  listContactsSchema,
  updateContactSchema,
} from '@/lib/validations/contact-validation'
import { PaginatedResult } from '@/types/pagination-type'
import { Prisma } from '../../generated/prisma/client'
import { checkIsAdmin, verifyContactOwnership } from './helpers'

type ContactListItem = Prisma.ContactGetPayload<{
  include: {
    user: { select: { id: true; name: true; email: true } }
    _count: { select: { addresses: true } }
  }
}>

type ContactDetail = Prisma.ContactGetPayload<{
  include: {
    user: { select: { id: true; name: true; email: true } }
    addresses: true
  }
}>

type ContactWithAddresses = Prisma.ContactGetPayload<{
  include: { addresses: true }
}>

const buildContactWhere = (
  userId: string,
  isAdminUser: boolean,
  input: ListContactsInput,
): Prisma.ContactWhereInput => {
  const where: Prisma.ContactWhereInput = {}

  if (!isAdminUser || input.filter === 'my_contacts') {
    where.userId = userId
  }

  if (input.query) {
    where.OR = [
      { firstName: { contains: input.query, mode: 'insensitive' } },
      { lastName: { contains: input.query, mode: 'insensitive' } },
      { email: { contains: input.query, mode: 'insensitive' } },
      { phone: { contains: input.query, mode: 'insensitive' } },
    ]
  }

  return where
}

export const getContacts = async (
  input: ListContactsInput,
): Promise<PaginatedResult<ContactListItem>> => {
  const session = await requireAuth()
  const isAdminUser = checkIsAdmin(session.user.role)
  const validated = listContactsSchema.parse(input)
  const where = buildContactWhere(session.user.id, isAdminUser, validated)

  const [data, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { addresses: true } },
      },
      orderBy: { [validated.sortBy]: validated.sortDirection },
      skip: (validated.page - 1) * validated.limit,
      take: validated.limit,
    }),
    prisma.contact.count({ where }),
  ])

  return {
    data,
    pagination: {
      page: validated.page,
      limit: validated.limit,
      total,
      totalPages: Math.ceil(total / validated.limit),
    },
  }
}

export const getContactById = async (contactId: string): Promise<ContactDetail> => {
  const session = await requireAuth()
  const isAdminUser = checkIsAdmin(session.user.role)
  const validatedId = contactIdSchema.parse(contactId)

  const contact = await prisma.contact.findUnique({
    where: { id: validatedId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      addresses: true,
    },
  })

  if (!contact) {
    throw new Error('Contact not found')
  }

  if (!isAdminUser && contact.userId !== session.user.id) {
    throw new Error('Contact not found')
  }

  return contact
}

export const createContact = async (input: ContactInputSchema): Promise<ContactWithAddresses> => {
  const session = await requireAuth()
  const validated = contactSchema.parse(input)

  return prisma.contact.create({
    data: {
      ...validated,
      userId: session.user.id,
    },
    include: { addresses: true },
  })
}

export const updateContact = async (
  contactId: string,
  input: UpdateContactInputSchema,
): Promise<ContactWithAddresses> => {
  const session = await requireAuth()
  const validatedId = contactIdSchema.parse(contactId)
  const validatedData = updateContactSchema.parse(input)

  await verifyContactOwnership(validatedId, session.user.id)

  return prisma.contact.update({
    where: { id: validatedId },
    data: validatedData,
    include: { addresses: true },
  })
}

export const deleteContact = async (contactId: string): Promise<{ id: string }> => {
  const session = await requireAuth()
  const validatedId = contactIdSchema.parse(contactId)

  await verifyContactOwnership(validatedId, session.user.id)

  return prisma.contact.delete({
    where: { id: validatedId },
    select: { id: true },
  })
}

export const deleteAllContact = async (): Promise<{ count: number }> => {
  const session = await requireAuth()

  const result = await prisma.contact.deleteMany({
    where: { userId: session.user.id },
  })

  return { count: result.count }
}
