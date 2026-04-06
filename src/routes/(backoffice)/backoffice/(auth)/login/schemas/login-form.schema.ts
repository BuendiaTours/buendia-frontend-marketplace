import { z } from 'zod/v3';

export const loginFormSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8)
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;
