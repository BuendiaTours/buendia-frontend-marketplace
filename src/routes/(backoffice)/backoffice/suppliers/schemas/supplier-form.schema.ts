import { z } from 'zod/v3';
import { CommissionKind } from '$core/suppliers/enums';

export const supplierFormSchema = z.object({
	id: z.string(),
	name: z.string().min(2).max(100),
	slug: z.string().min(2).max(100),
	commissionKind: z.nativeEnum(CommissionKind),
	commissionValue: z.number().min(0),
	companyName: z.string().min(2).max(200),
	vat: z.string().min(2).max(50),
	ownerFirstName: z.string().min(2).max(100),
	ownerLastName: z.string().min(2).max(100),
	email: z.string().email(),
	phone: z.string().max(30).optional().default(''),
	postalAddress: z.string().max(500).optional().default(''),
	logoUrl: z.string().url().or(z.literal('')).optional().default(''),
	aboutUs: z.string().max(2000).optional().default('')
});

export type SupplierFormSchema = z.infer<typeof supplierFormSchema>;
