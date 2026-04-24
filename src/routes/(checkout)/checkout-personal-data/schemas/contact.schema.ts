import { z } from 'zod';

export const contactSchema = z.object({
	firstName: z.string().min(1, 'El nombre es obligatorio'),
	lastName: z.string().min(1, 'Los apellidos son obligatorios'),
	email: z.string().min(1, 'El email es obligatorio').email('El email no tiene un formato válido'),
	countryCode: z.string().min(1, 'Selecciona un país'),
	phoneValid: z.literal(true, { error: 'El teléfono no es válido' })
});
