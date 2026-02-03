import { z } from 'zod';

// Enums used
import {
	ACTIVITY_NOT_SUITABLE_FOR_VALUES,
	ACTIVITY_STATUS_VALUES,
	STAGE_KIND_VALUES,
	STAGE_REQUIREMENT_VALUES,
	STAGE_RELEVANCE_VALUES,
	MEAL_ADDITIONAL_VALUES,
	MEAL_ALLERGEN_VALUES,
	MEAL_FORMAT_VALUES,
	MEAL_KIND_VALUES
} from '$lib/config/enums';

/**
 * Schema de validación para el formulario de actividades
 * Usado tanto en creación como en edición
 */
export const activityFormSchema = z.object({
	id: z.string(),
	title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
	slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres').max(100),
	codeRef: z.string(),
	descriptionFull: z.string().min(3, 'El campo debe tener al menos 3 caracteres'),
	descriptionShort: z.string().min(3, 'El campo debe tener al menos 3 caracteres'),
	infoImportant: z.string(),
	phoneContact: z.string().optional(),
	tags: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.default([]),
	categories: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.default([]),
	attractions: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.default([]),
	destinations: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.default([]),
	distributives: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.default([]),
	stages: z
		.array(
			z.object({
				id: z.string(),
				activityId: z.string(),
				order: z.number().int().min(1),
				name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
				description: z.string().optional(),
				duration: z.string().optional(),
				location: z
					.object({
						type: z.literal('Point'),
						coordinates: z.tuple([
							z.number().min(-180).max(180), // longitude
							z.number().min(-90).max(90) // latitude
						])
					})
					.nullable()
					.default(null),
				kind: z.enum(STAGE_KIND_VALUES, {
					errorMap: () => ({ message: 'Debe seleccionar un tipo válido' })
				}),
				relevance: z.enum(STAGE_RELEVANCE_VALUES, {
					errorMap: () => ({ message: 'Debe seleccionar una relevancia válida' })
				}),
				requirement: z.enum(STAGE_REQUIREMENT_VALUES, {
					errorMap: () => ({ message: 'Debe seleccionar un requisito válido' })
				})
			})
		)
		.default([]),
	meals: z
		.array(
			z.object({
				id: z.string(),
				additionalOptions: z.array(z.enum(MEAL_ADDITIONAL_VALUES)).default([]),
				allergens: z.array(z.enum(MEAL_ALLERGEN_VALUES)).default([]),
				format: z.enum(MEAL_FORMAT_VALUES, {
					errorMap: () => ({ message: 'Debe seleccionar un formato válido' })
				}),
				kind: z.enum(MEAL_KIND_VALUES, {
					errorMap: () => ({ message: 'Debe seleccionar un tipo de comida válido' })
				})
			})
		)
		.default([]),
	excluded: z.array(z.string()).default([]),
	included: z.array(z.string()).default([]),
	itemsToBring: z.array(z.string()).default([]),
	notSuitableFor: z.array(z.enum(ACTIVITY_NOT_SUITABLE_FOR_VALUES)).default([]),
	kind: z.string().optional(),
	guideKind: z.string().optional(),
	status: z.enum(ACTIVITY_STATUS_VALUES, {
		errorMap: () => ({ message: 'Debe seleccionar un tipo válido' })
	})
});

export type ActivityFormSchema = z.infer<typeof activityFormSchema>;
