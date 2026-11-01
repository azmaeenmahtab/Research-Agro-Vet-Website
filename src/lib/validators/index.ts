import { z } from 'zod';

export const bdPhoneRegex = /^01[3-9]\d{8}$/;

export const phoneSchema = z
  .string()
  .trim()
  .regex(bdPhoneRegex, 'Please enter a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX)');

export const checkoutFormSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: phoneSchema,
  customerAltPhone: z
    .string()
    .trim()
    .regex(bdPhoneRegex, 'Invalid alternate phone number')
    .optional()
    .or(z.literal('')),
  district: z.string().min(1, 'Please select a district'),
  upazila: z.string().min(1, 'Please select or enter upazila/thana'),
  address: z.string().min(5, 'Detailed street address is required'),
  orderNote: z.string().max(500).optional(),
  buyerMode: z.enum(['RETAIL', 'WHOLESALE']).default('RETAIL'),
  paymentMethod: z.enum(['COD', 'SSLCOMMERZ', 'PARTIAL_ADVANCE']).default('COD'),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, 'At least one item is required in the cart'),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const adminProductSchema = z.object({
  nameEn: z.string().min(2, 'English name is required'),
  nameBn: z.string().optional(),
  categoryId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  formFactor: z.string().default('POWDER'),
  speciesTags: z.array(z.string()).default([]),
  dlsLicenseNo: z.string().optional(),
  bangladeshPatentNo: z.string().optional(),
  composition: z.string().optional(),
  indication: z.string().optional(),
  dosageAndAdministration: z.string().optional(),
  variants: z.array(
    z.object({
      packSize: z.string().min(1),
      tradePrice: z.number().nonnegative(),
      mrpPrice: z.number().nonnegative(),
      sellingPrice: z.number().nonnegative(),
      stockQuantity: z.number().int().default(100),
      minWholesaleQty: z.number().int().optional(),
    })
  ),
});

export type AdminProductFormValues = z.infer<typeof adminProductSchema>;
