import { z } from 'zod';

// Enums used
import {
	ACTIVITY_NOT_SUITABLE_FOR_OPTIONS,
	ACTIVITY_STATUS_OPTIONS,
	STAGE_KIND_OPTIONS,
	STAGE_REQUIREMENT_OPTIONS,
	STAGE_RELEVANCE_OPTIONS
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
				kind: z.enum(STAGE_KIND_OPTIONS.map((option) => option.id) as [string, ...string[]], {
					errorMap: () => ({ message: 'Debe seleccionar un tipo válido' })
				}),
				relevance: z.enum(
					STAGE_RELEVANCE_OPTIONS.map((option) => option.id) as [string, ...string[]],
					{
						errorMap: () => ({ message: 'Debe seleccionar una relevancia válida' })
					}
				),
				requirement: z.enum(
					STAGE_REQUIREMENT_OPTIONS.map((option) => option.id) as [string, ...string[]],
					{
						errorMap: () => ({ message: 'Debe seleccionar un requisito válido' })
					}
				)
			})
		)
		.default([]),
	excluded: z.array(z.string()).default([]),
	included: z.array(z.string()).default([]),
	itemsToBring: z.array(z.string()).default([]),
	notSuitableFor: z
		.array(
			z.enum(ACTIVITY_NOT_SUITABLE_FOR_OPTIONS.map((option) => option.id) as [string, ...string[]])
		)
		.default([]),
	kind: z.string().optional(),
	guideKind: z.string().optional(),
	status: z.enum(ACTIVITY_STATUS_OPTIONS.map((option) => option.id) as [string, ...string[]], {
		errorMap: () => ({ message: 'Debe seleccionar un tipo válido' })
	})
});

export type ActivityFormSchema = z.infer<typeof activityFormSchema>;
