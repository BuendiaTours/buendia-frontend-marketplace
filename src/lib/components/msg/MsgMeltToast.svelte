<script lang="ts">
	import { createToaster, melt } from '@melt-ui/svelte';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { Cancel, InfoEmpty, WarningTriangle, CheckCircle } from 'svelte-iconoir';
	import { page } from '$app/stores';

	/**
	 * Componente de Toast usando Melt-UI
	 * Muestra notificaciones temporales en la esquina superior derecha
	 * Se integra con el sistema de alertas de SvelteKit ($page.form.alert o $page.data.alert)
	 */

	type ToastType = 'info' | 'warning' | 'error' | 'success';

	interface ToastData {
		title: string;
		description: string;
		type: ToastType;
	}

	interface AlertMessage {
		type: ToastType;
		message: string;
	}

	const {
		elements: { content, title, description, close },
		helpers: { addToast },
		states: { toasts },
		actions: { portal }
	} = createToaster<ToastData>();

	// Configuración de estilos y colores por tipo
	const toastConfig = {
		info: {
			bgClass: 'bg-info text-info-content',
			Icon: InfoEmpty
		},
		warning: {
			bgClass: 'bg-warning text-warning-content',
			Icon: WarningTriangle
		},
		error: {
			bgClass: 'bg-error text-error-content',
			Icon: Cancel
		},
		success: {
			bgClass: 'bg-success text-success-content',
			Icon: CheckCircle
		}
	};

	// Obtener el mensaje de alerta desde $page.form o $page.data
	const alert = $derived(
		($page.form?.alert as AlertMessage | undefined) ||
			($page.data?.alert as AlertMessage | undefined)
	);

	// Mostrar toast automáticamente cuando hay una alerta
	$effect(() => {
		if (alert) {
			addToast({
				data: {
					title: alert.type.charAt(0).toUpperCase() + alert.type.slice(1),
					description: alert.message,
					type: alert.type
				}
			});
		}
	});

	// Exportar la función addToast para uso manual
	export { addToast };
</script>

<div
	class="fixed top-0 right-0 z-50 m-4 flex flex-col items-end gap-2 md:top-auto md:bottom-0"
	use:portal
>
	{#each $toasts as { id, data } (id)}
		{@const config = toastConfig[data.type]}
		{@const IconComponent = config.Icon}
		<div
			use:melt={$content(id)}
			animate:flip={{ duration: 500 }}
			in:fly={{ duration: 150, x: '100%' }}
			out:fly={{ duration: 150, x: '100%' }}
			class="rounded-lg shadow-lg {config.bgClass}"
		>
			<div
				class="relative flex w-[24rem] max-w-[calc(100vw-2rem)] items-center justify-between gap-4 p-5"
			>
				<div class="flex items-start gap-3">
					<IconComponent class="size-6 shrink-0" />
					<div class="flex-1">
						<h3 use:melt={$title(id)} class="text-md flex items-center gap-2 font-semibold">
							{data.title}
						</h3>
						<div use:melt={$description(id)} class="mt-1 text-sm opacity-90">
							{data.description}
						</div>
					</div>
				</div>
				<button
					use:melt={$close(id)}
					class="absolute top-2 right-2 grid size-6 cursor-pointer place-items-center rounded-full hover:bg-black/10"
				>
					<Cancel class="size-4" />
				</button>
			</div>
		</div>
	{/each}
</div>
