'use server'

import { requireAuth } from '@/lib/auth-util'
import { prisma } from '@/lib/prisma'
import {
  AddressInputSchema,
  UpdateAddressInputSchema,
  addressIdSchema,
  addressSchema,
  updateAddressSchema,
} from '@/lib/validations/address-validation'
import { contactIdSchema } from '@/lib/validations/contact-validation'
import { Prisma } from '../../generated/prisma/client'
import { checkIsAdmin, verifyAddressOwnership, verifyContactOwnership } from './helpers'

type AddressDetail = Prisma.AddressGetPayload<{
  include: {
    contact: {
      include: {
        user: { select: { id: true; name: true; email: true } }
      }
    }
  }
}>

type AddressBasic = Prisma.AddressGetPayload<Record<string, unknown>>

export const getAddresses = async (contactId: string): Promise<AddressBasic[]> => {
  const session = await requireAuth()
  const isAdminUser = checkIsAdmin(session.user.role)
  const validatedContactId = contactIdSchema.parse(contactId)

  const contact = await prisma.contact.findUnique({
    where: { id: validatedContactId },
    select: { userId: true },
  })

  if (!contact) {
    throw new Error('Contact not found')
  }

  if (!isAdminUser && contact.userId !== session.user.id) {
    throw new Error('Contact not found')
  }

  return prisma.address.findMany({
    where: { contactId: validatedContactId },
    orderBy: { createdAt: 'asc' },
  })
}

export const getAddressById = async (addressId: string): Promise<AddressDetail> => {
  const session = await requireAuth()
  const isAdminUser = checkIsAdmin(session.user.role)
  const validatedId = addressIdSchema.parse(addressId)

  const address = await prisma.address.findUnique({
    where: { id: validatedId },
    include: {
      contact: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  })

  if (!address) {
    throw new Error('Address not found')
  }

  if (!isAdminUser && address.contact.userId !== session.user.id) {
    throw new Error('Address not found')
  }

  return address
}

export const createAddress = async (
  contactId: string,
  input: AddressInputSchema,
): Promise<AddressBasic> => {
  const session = await requireAuth()
  const validatedContactId = contactIdSchema.parse(contactId)
  const validatedData = addressSchema.parse(input)

  await verifyContactOwnership(validatedContactId, session.user.id)

  return prisma.address.create({
    data: {
      ...validatedData,
      contactId: validatedContactId,
    },
  })
}

export const updateAddress = async (
  addressId: string,
  input: UpdateAddressInputSchema,
): Promise<AddressBasic> => {
  const session = await requireAuth()
  const validatedId = addressIdSchema.parse(addressId)
  const validatedData = updateAddressSchema.parse(input)

  await verifyAddressOwnership(validatedId, session.user.id)

  return prisma.address.update({
    where: { id: validatedId },
    data: validatedData,
  })
}

export const deleteAddress = async (addressId: string): Promise<{ id: string }> => {
  const session = await requireAuth()
  const validatedId = addressIdSchema.parse(addressId)

  await verifyAddressOwnership(validatedId, session.user.id)

  return prisma.address.delete({
    where: { id: validatedId },
    select: { id: true },
  })
}

export const deleteAllAddress = async (contactId: string): Promise<{ count: number }> => {
  const session = await requireAuth()
  const validatedContactId = contactIdSchema.parse(contactId)

  await verifyContactOwnership(validatedContactId, session.user.id)

  const result = await prisma.address.deleteMany({
    where: { contactId: validatedContactId },
  })

  return { count: result.count }
}
