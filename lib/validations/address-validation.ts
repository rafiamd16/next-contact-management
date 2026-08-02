import z from 'zod'

export const addressSchema = z.object({
  street: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
  country: z.string().trim().min(3, 'Country must be at least 3 characters'),
  postalCode: z.string().trim().optional(),
})

export const addressIdSchema = z.string().min(1, 'Address id wajib diisi')

export const updateAddressSchema = addressSchema.partial()

export type AddressInputSchema = z.infer<typeof addressSchema>
export type UpdateAddressInputSchema = z.infer<typeof updateAddressSchema>
