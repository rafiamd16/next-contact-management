'use server'

import type { Address } from '@/generated/prisma/client'
import { requireAuth } from '@/lib/auth-util'
import { findAddressById, findOwnedAddressById } from '@/lib/helpers/address-helper'
import { findContactById, findOwnedContactById } from '@/lib/helpers/contact-helper'
import { prisma } from '@/lib/prisma'
import {
  addressIdSchema,
  addressSchema,
  updateAddressSchema,
  type AddressInputSchema,
  type UpdateAddressInputSchema,
} from '@/lib/validations/address-validation'
import { contactIdSchema } from '@/lib/validations/contact-validation'
import type { ActionResponse } from '@/types/action-response'
import { revalidatePath } from 'next/cache'

const USER_CONTACTS_PATH = '/dashboard/contacts'
const ADMIN_CONTACTS_PATH = '/admin/contacts'

const revalidateAddressPaths = (contactId: string) => {
  revalidatePath(`${USER_CONTACTS_PATH}/${contactId}`)
  revalidatePath(`${ADMIN_CONTACTS_PATH}/${contactId}`)
}

export const getAddresses = async (contactId: string): Promise<ActionResponse<Address[]>> => {
  const session = await requireAuth()

  const parsedId = contactIdSchema.safeParse(contactId)
  if (!parsedId.success) {
    return {
      success: false,
      error: parsedId.error.issues[0]?.message ?? 'Contact id tidak valid',
    }
  }

  const isAdmin = session.user.role === 'admin'

  try {
    const existingContact = isAdmin
      ? await findContactById(parsedId.data)
      : await findOwnedContactById(parsedId.data, session.user.id)

    if (!existingContact) {
      return { success: false, error: 'Contact tidak ditemukan' }
    }

    const addresses = await prisma.address.findMany({
      where: { contactId: parsedId.data },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: addresses }
  } catch (error) {
    console.error('getAddresses error:', error)
    return { success: false, error: 'Gagal mengambil data address' }
  }
}

export const getAddressById = async (addressId: string): Promise<ActionResponse<Address>> => {
  const session = await requireAuth()

  const parsedId = addressIdSchema.safeParse(addressId)
  if (!parsedId.success) {
    return { success: false, error: parsedId.error.issues[0]?.message ?? 'Address id tidak valid' }
  }

  const isAdmin = session.user.role === 'admin'

  try {
    const address = isAdmin
      ? await findAddressById(parsedId.data)
      : await findOwnedAddressById(parsedId.data, session.user.id)

    if (!address) {
      return { success: false, error: 'Address tidak ditemukan' }
    }

    return { success: true, data: address }
  } catch (error) {
    console.error('getAddressById error:', error)
    return { success: false, error: 'Gagal mengambil data address' }
  }
}

export const createAddress = async (
  contactId: string,
  input: AddressInputSchema,
): Promise<ActionResponse<Address>> => {
  const session = await requireAuth()

  const parsedId = contactIdSchema.safeParse(contactId)
  if (!parsedId.success) {
    return {
      success: false,
      error: parsedId.error.issues[0]?.message ?? 'Contact id tidak valid',
    }
  }

  const parsed = addressSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  try {
    const existingContact = await findOwnedContactById(parsedId.data, session.user.id)
    if (!existingContact) {
      return { success: false, error: 'Contact tidak ditemukan' }
    }

    const address = await prisma.address.create({
      data: {
        ...parsed.data,
        contactId: parsedId.data,
      },
    })

    revalidateAddressPaths(parsedId.data)

    return { success: true, data: address }
  } catch (error) {
    console.error('createAddress error:', error)
    return { success: false, error: 'Gagal membuat address' }
  }
}

export const updateAddress = async (
  addressId: string,
  input: UpdateAddressInputSchema,
): Promise<ActionResponse<Address>> => {
  const session = await requireAuth()

  const parsedId = addressIdSchema.safeParse(addressId)
  if (!parsedId.success) {
    return { success: false, error: parsedId.error.issues[0]?.message ?? 'Address id tidak valid' }
  }

  const parsed = updateAddressSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  try {
    const existingAddress = await findOwnedAddressById(parsedId.data, session.user.id)
    if (!existingAddress) {
      return { success: false, error: 'Address tidak ditemukan' }
    }

    const address = await prisma.address.update({
      where: { id: parsedId.data },
      data: parsed.data,
    })

    revalidateAddressPaths(existingAddress.contactId)

    return { success: true, data: address }
  } catch (error) {
    console.error('updateAddress error:', error)
    return { success: false, error: 'Gagal mengupdate address' }
  }
}

export const deleteAddress = async (addressId: string): Promise<ActionResponse> => {
  const session = await requireAuth()

  const parsedId = addressIdSchema.safeParse(addressId)
  if (!parsedId.success) {
    return { success: false, error: parsedId.error.issues[0]?.message ?? 'Address id tidak valid' }
  }

  try {
    const existingAddress = await findOwnedAddressById(parsedId.data, session.user.id)
    if (!existingAddress) {
      return { success: false, error: 'Address tidak ditemukan' }
    }

    await prisma.address.delete({ where: { id: parsedId.data } })

    revalidateAddressPaths(existingAddress.contactId)

    return { success: true, data: null }
  } catch (error) {
    console.error('deleteAddress error:', error)
    return { success: false, error: 'Gagal menghapus address' }
  }
}

export const deleteAllAddress = async (contactId: string): Promise<ActionResponse> => {
  const session = await requireAuth()

  const parsedId = contactIdSchema.safeParse(contactId)
  if (!parsedId.success) {
    return {
      success: false,
      error: parsedId.error.issues[0]?.message ?? 'Contact id tidak valid',
    }
  }

  try {
    const existingContact = await findOwnedContactById(parsedId.data, session.user.id)
    if (!existingContact) {
      return { success: false, error: 'Contact tidak ditemukan' }
    }

    await prisma.address.deleteMany({ where: { contactId: parsedId.data } })

    revalidateAddressPaths(parsedId.data)

    return { success: true, data: null }
  } catch (error) {
    console.error('deleteAllAddress error:', error)
    return { success: false, error: 'Gagal menghapus semua address' }
  }
}
