'use server'

import type { Contact, Prisma } from '@/generated/prisma/client'
import { requireAuth } from '@/lib/auth-util'
import { findContactById, findOwnedContactById } from '@/lib/helpers/contact-helper'
import { prisma } from '@/lib/prisma'
import { contactWithUserInclude, type ContactWithUser } from '@/lib/selects/contact-select'
import {
  contactIdSchema,
  contactSchema,
  listContactsSchema,
  updateContactSchema,
  type ContactInputSchema,
  type ListContactsInput,
  type UpdateContactInputSchema,
} from '@/lib/validations/contact-validation'
import type { ActionResponse } from '@/types/action-response'
import type { PaginatedResult } from '@/types/pagination'
import { revalidatePath } from 'next/cache'

const USER_CONTACTS_PATH = '/dashboard/contacts'
const ADMIN_CONTACTS_PATH = '/admin/contacts'

const revalidateContactPaths = (contactId?: string) => {
  revalidatePath(USER_CONTACTS_PATH)
  revalidatePath(ADMIN_CONTACTS_PATH)
  if (contactId) {
    revalidatePath(`${USER_CONTACTS_PATH}/${contactId}`)
    revalidatePath(`${ADMIN_CONTACTS_PATH}/${contactId}`)
  }
}

export const getContacts = async (
  params: ListContactsInput,
): Promise<ActionResponse<PaginatedResult<ContactWithUser>>> => {
  const session = await requireAuth()

  const parsed = listContactsSchema.safeParse(params)
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  const { page, limit, query, sortBy, sortDirection, filter } = parsed.data
  const isAdmin = session.user.role === 'admin'

  const where: Prisma.ContactWhereInput = {
    ...(query && {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ],
    }),
    ...(isAdmin && filter === 'all' ? {} : { userId: session.user.id }),
  }

  try {
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: contactWithUserInclude,
        orderBy: { [sortBy]: sortDirection },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ])
    return {
      success: true,
      data: {
        data: contacts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    }
  } catch (error) {
    console.error('getContacts error:', error)
    return { success: false, error: 'Gagal mengambil data contact' }
  }
}

export const getContactById = async (
  contactId: string,
): Promise<ActionResponse<ContactWithUser>> => {
  const session = await requireAuth()

  const parsedId = contactIdSchema.safeParse(contactId)
  if (!parsedId.success)
    return { success: false, error: parsedId.error.issues[0]?.message ?? 'Contact id tidak valid' }

  const isAdmin = session.user.role === 'admin'

  try {
    const contact = isAdmin
      ? await findContactById(parsedId.data)
      : await findOwnedContactById(parsedId.data, session.user.id)

    if (!contact) return { success: false, error: 'Contact tidak ditemukan' }

    if (!isAdmin && contact.userId !== session.user.id) {
      return { success: false, error: 'Contact tidak ditemukan' }
    }

    return { success: true, data: contact }
  } catch (error) {
    console.error('getContactById error:', error)
    return { success: false, error: 'Gagal mengambil data contact' }
  }
}

export const createContact = async (
  input: ContactInputSchema,
): Promise<ActionResponse<Contact>> => {
  const session = await requireAuth()

  const parsed = contactSchema.safeParse(input)
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    const contact = await prisma.contact.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
    })

    revalidateContactPaths()

    return { success: true, data: contact }
  } catch (error) {
    console.error('createContact error:', error)
    return { success: false, error: 'Gagal membuat contact' }
  }
}

export const updateContact = async (
  contactId: string,
  input: UpdateContactInputSchema,
): Promise<ActionResponse<Contact>> => {
  const session = await requireAuth()

  const parsedId = contactIdSchema.safeParse(contactId)
  if (!parsedId.success)
    return { success: false, error: parsedId.error.issues[0]?.message ?? 'Contact id tidak valid' }

  const parsed = updateContactSchema.safeParse(input)
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    const existingContact = await findOwnedContactById(parsedId.data, session.user.id)
    if (!existingContact) return { success: false, error: 'Contact tidak ditemukan' }

    const contact = await prisma.contact.update({
      where: { id: parsedId.data },
      data: parsed.data,
    })

    revalidateContactPaths(contactId)

    return { success: true, data: contact }
  } catch (error) {
    console.error('updateContact error:', error)
    return { success: false, error: 'Gagal mengubah contact' }
  }
}

export const deleteContact = async (contactId: string): Promise<ActionResponse> => {
  const session = await requireAuth()

  const parsedId = contactIdSchema.safeParse(contactId)
  if (!parsedId.success)
    return { success: false, error: parsedId.error.issues[0]?.message ?? 'Contact id tidak valid' }

  try {
    const existingContact = await findOwnedContactById(parsedId.data, session.user.id)
    if (!existingContact) return { success: false, error: 'Contact tidak ditemukan' }

    await prisma.contact.delete({ where: { id: parsedId.data } })

    revalidateContactPaths(contactId)

    return { success: true, data: null }
  } catch (error) {
    console.error('deleteContact error:', error)
    return { success: false, error: 'Gagal menghapus contact' }
  }
}

export const deleteAllContact = async (): Promise<ActionResponse> => {
  const session = await requireAuth()

  try {
    await prisma.contact.deleteMany({ where: { userId: session.user.id } })

    revalidateContactPaths()

    return { success: true, data: null }
  } catch (error) {
    console.error('deleteAllContact error:', error)
    return { success: false, error: 'Gagal menghapus semua contact' }
  }
}
