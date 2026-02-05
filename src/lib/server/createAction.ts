import { redirect, fail } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ApiError } from '$lib/api/index';
import { setFlashMessage } from '$lib/server/flashMessages';
import { superValidate } from 'sveltekit-superforms';

/**
 * Configuración para crear un action handler de creación
 */
export interface CreateActionConfig {
	/** Ruta base para redirección después de crear (ej: '/activities', '/attractions') */
	basePath: string;
	/** Schema de validación (adaptador de Zod) */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	schema: any;
	/** Función que realiza la creación en la API */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	createFn: (fetchFn: typeof globalThis.fetch, data: any) => Promise<any>;
	/** Nombre de la entidad para mensajes (ej: 'actividad', 'atracción', 'destino') */
	entityName: string;
	/** Función opcional para transformar los datos del formulario antes de enviarlos a la API */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	transformData?: (formData: any) => any;
	/** Si true, redirige a la página de edición; si false, redirige a la página de detalle */
	redirectToEdit?: boolean;
}

/**
 * Crea un action handler genérico para crear recursos.
 *
 * Este factory maneja:
 * - Validación del formulario con el schema proporcionado
 * - Llamada a la API para crear el recurso
 * - Manejo consistente de errores con mensajes personalizados
 * - Flash messages de éxito y error
 * - Redirección automática a la página de edición o detalle
 *
 * @example
 * ```typescript
 * import { createCreateAction } from '$lib/server/createAction';
 * import { api } from '$lib/api/index';
 * import { activityFormSchema } from './activity-form.schema';
 * import { zod } from 'sveltekit-superforms/adapters';
 *
 * export const actions = {
 *   default: createCreateAction({
 *     basePath: '/activities',
 *     schema: zod(activityFormSchema),
 *     createFn: api.activities.create,
 *     entityName: 'actividad',
 *     redirectToEdit: true
 *   })
 * };
 * ```
 */
export function createCreateAction(config: CreateActionConfig) {
	return async ({ request, fetch, cookies }: RequestEvent) => {
		const { basePath, schema, createFn, entityName, transformData, redirectToEdit = true } = config;

		console.log(`🆕 [createAction] Iniciando creación de ${entityName}`);

		// 1. Validar formulario
		const form = await superValidate(request, schema);
		console.log(`🆕 [createAction] Validación:`, form.valid ? '✅ Válido' : '❌ Inválido');

		if (!form.valid) {
			console.error(`🆕 [createAction] Errores de validación:`, form.errors);
			const errorMessage = 'Por favor, corrige los errores del formulario.';
			setFlashMessage(cookies, {
				type: 'error',
				message: errorMessage
			});
			return fail(400, {
				form,
				alert: {
					type: 'error',
					message: errorMessage
				}
			});
		}

		try {
			console.log(`🆕 [createAction] Llamando a API para crear ${entityName}...`);
			console.log(`🆕 [createAction] Datos a enviar:`, {
				id: form.data.id,
				...(form.data.title ? { title: form.data.title } : {}),
				...(form.data.name ? { name: form.data.name } : {}),
				slug: form.data.slug
			});

			// 2. Transformar datos si es necesario
			const dataToSend = transformData ? transformData(form.data) : form.data;

			// 3. Llamar a la API para crear el recurso
			const result = await createFn(fetch, dataToSend);
			console.log(`✅ [createAction] ${entityName} creado exitosamente:`, result);

			// 4. Flash message de éxito
			const successMessage = `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} ${entityName.endsWith('ión') ? 'creada' : 'creado'} correctamente.`;
			setFlashMessage(cookies, {
				type: 'success',
				message: successMessage
			});

			// 5. Redirigir a la página de edición o detalle
			const redirectPath = redirectToEdit
				? `${basePath}/${result.slug}/edit`
				: `${basePath}/${result.slug}`;

			console.log(`🆕 [createAction] Redirigiendo a:`, redirectPath);
			throw redirect(303, redirectPath);
		} catch (err) {
			console.error(`❌ [createAction] Error capturado:`, err);
			console.error(`❌ [createAction] Tipo de error:`, err?.constructor?.name);

			// Si es un redirect, dejarlo pasar (es el comportamiento esperado)
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
				console.log(`✅ [createAction] Es un redirect, dejándolo pasar`);
				throw err;
			}

			// 6. Manejar ApiError con mensajes personalizados
			let errorMessage = `Error al crear ${entityName}.`;

			if (err instanceof ApiError && err.status) {
				console.error(`❌ [createAction] ApiError con status:`, err.status);

				// Determinar artículo (el/la) según terminación
				const article = entityName.endsWith('ión') ? 'la' : 'el';

				switch (err.status) {
					case 400: // Bad Request - Solicitud inválida
						errorMessage = 'Los datos enviados no son válidos.';
						break;
					case 401: // Unauthorized - No autenticado
						errorMessage = `Debes iniciar sesión para crear [${entityName}].`;
						break;
					case 403: // Forbidden - No autorizado
						errorMessage = `No tienes permisos para crear [${entityName}].`;
						break;
					case 404: // Not Found - Endpoint no encontrado
						errorMessage = 'Endpoint de creación no encontrado en la API.';
						break;
					case 409: // Conflict - Conflicto (ej: slug duplicado)
						errorMessage = `Ya existe [${entityName}] con este slug. Por favor, elige otro.`;
						break;
					case 422: // Unprocessable Entity - Validación fallida en servidor
						errorMessage = 'Los datos no cumplen con los requisitos del servidor.';
						break;
					case 500: // Internal Server Error - Error del servidor
						errorMessage = 'Error del servidor. Por favor, inténtalo más tarde.';
						break;
					case 503: // Service Unavailable - Servicio no disponible
						errorMessage = 'El servicio no está disponible. Por favor, inténtalo más tarde.';
						break;
					default:
						errorMessage = `Error al crear [${article}] {${entityName}} (código ${err.status}).`;
				}

				setFlashMessage(cookies, {
					type: 'error',
					message: errorMessage
				});

				return fail(err.status || 500, {
					form,
					alert: {
						type: 'error',
						message: errorMessage
					}
				});
			}

			// 7. Error desconocido
			console.error(`❌ [createAction] Error desconocido`);
			errorMessage = `Error inesperado al crear [${entityName}]. Por favor, inténtalo de nuevo.`;
			setFlashMessage(cookies, {
				type: 'error',
				message: errorMessage
			});

			return fail(503, {
				form,
				alert: {
					type: 'error',
					message: errorMessage
				}
			});
		}
	};
}
