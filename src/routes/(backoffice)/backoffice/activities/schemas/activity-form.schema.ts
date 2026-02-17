import { z } from 'zod/v3';

import {
	ActivityStatus,
	StageKind,
	StageRequirement,
	StageRelevance,
	MealAdditional,
	ActivityAllergen,
	MealFormat,
	MealKind
} from '$core/activities/enums';

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
				kind: z.nativeEnum(StageKind, {
					errorMap: () => ({ message: 'Debe seleccionar un tipo válido' })
				}),
				relevance: z.nativeEnum(StageRelevance, {
					errorMap: () => ({ message: 'Debe seleccionar una relevancia válida' })
				}),
				requirement: z.nativeEnum(StageRequirement, {
					errorMap: () => ({ message: 'Debe seleccionar un requisito válido' })
				})
			})
		)
		.default([]),
	meals: z
		.array(
			z.object({
				id: z.string(),
				additionalOptions: z.array(z.nativeEnum(MealAdditional)).default([]),
				allergens: z.array(z.nativeEnum(ActivityAllergen)).default([]),
				format: z.nativeEnum(MealFormat, {
					errorMap: () => ({ message: 'Debe seleccionar un formato válido' })
				}),
				kind: z.nativeEnum(MealKind, {
					errorMap: () => ({ message: 'Debe seleccionar un tipo de comida válido' })
				})
			})
		)
		.default([]),
	excluded: z.array(z.string()).default([]),
	included: z.array(z.string()).default([]),
	itemsToBring: z.array(z.string()).default([]),
	notSuitableFor: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.default([]),
	kind: z.string().optional(),
	guideKind: z.string().optional(),
	status: z.nativeEnum(ActivityStatus, {
		errorMap: () => ({ message: 'Debe seleccionar un tipo válido' })
	})
});

export type ActivityFormSchema = z.infer<typeof activityFormSchema>;
