/**
 * Spanish error map for Zod validation messages.
 * Call `initZodErrorMap()` once at app startup to override default English messages.
 */
import { z } from 'zod/v3';

const zodErrorMapEs: z.ZodErrorMap = (issue, ctx) => {
	switch (issue.code) {
		case z.ZodIssueCode.invalid_type:
			if (issue.received === 'undefined' || issue.received === 'null') {
				return { message: 'Este campo es obligatorio' };
			}
			return { message: `Se esperaba ${issue.expected}, se recibió ${issue.received}` };

		case z.ZodIssueCode.too_small:
			if (issue.type === 'string') {
				if (issue.minimum === 1) return { message: 'Este campo es obligatorio' };
				return { message: `Debe tener al menos ${issue.minimum} caracteres` };
			}
			if (issue.type === 'number') {
				return { message: `Debe ser mayor o igual a ${issue.minimum}` };
			}
			if (issue.type === 'array') {
				return { message: `Debe tener al menos ${issue.minimum} elementos` };
			}
			return { message: `Valor demasiado pequeño` };

		case z.ZodIssueCode.too_big:
			if (issue.type === 'string') {
				return { message: `No puede tener más de ${issue.maximum} caracteres` };
			}
			if (issue.type === 'number') {
				return { message: `Debe ser menor o igual a ${issue.maximum}` };
			}
			if (issue.type === 'array') {
				return { message: `No puede tener más de ${issue.maximum} elementos` };
			}
			return { message: `Valor demasiado grande` };

		case z.ZodIssueCode.invalid_string:
			if (issue.validation === 'email') return { message: 'Email no válido' };
			if (issue.validation === 'url') return { message: 'URL no válida' };
			return { message: 'Formato no válido' };

		case z.ZodIssueCode.invalid_enum_value:
			return { message: 'Debe seleccionar una opción válida' };

		case z.ZodIssueCode.invalid_date:
			return { message: 'Fecha no válida' };

		case z.ZodIssueCode.invalid_literal:
			return { message: `Valor no válido` };

		case z.ZodIssueCode.custom:
			return { message: ctx.defaultError };

		default:
			return { message: ctx.defaultError };
	}
};

/** Registers the Spanish error map globally. Call once at app init. */
export function initZodErrorMap() {
	z.setErrorMap(zodErrorMapEs);
}
