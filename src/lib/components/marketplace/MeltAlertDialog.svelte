<!--
AlertDialog global con Melt-UI
https://melt-ui.com/docs/builders/dialog

Este componente debe incluirse en el layout principal.
Usa la función confirm() desde MeltAlertDialog.ts para mostrar diálogos de confirmación.
-->

<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { setConfirmFunction } from './MeltAlertDialog';
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { Close } from '$lib/icons/Linear';

	type ConfirmState = {
		open: boolean;
		title: string;
		message: string;
		confirmText: string;
		cancelText: string;
		danger: boolean;
		resolve?: (value: boolean) => void;
	};

	const confirmState = $state<ConfirmState>({
		open: false,
		title: 'Confirmar',
		message: '',
		confirmText: 'Aceptar',
		cancelText: 'Cancelar',
		danger: false
	});

	const {
		elements: { overlay, content, title, description, close, portalled },
		states: { open }
	} = createDialog({
		role: 'alertdialog',
		forceVisible: true,
		onOpenChange: ({ next }) => {
			confirmState.open = next;
			// Si se cierra sin resolver, cancelar
			if (!next && confirmState.resolve) {
				confirmState.resolve(false);
				confirmState.resolve = undefined;
			}
			return next;
		}
	});

	function confirmInternal(opts: {
		title?: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		danger?: boolean;
	}): Promise<boolean> {
		return new Promise((resolve) => {
			confirmState.title = opts.title ?? 'Confirmar';
			confirmState.message = opts.message;
			confirmState.confirmText = opts.confirmText ?? 'Aceptar';
			confirmState.cancelText = opts.cancelText ?? 'Cancelar';
			confirmState.danger = opts.danger ?? false;
			confirmState.resolve = resolve;
			confirmState.open = true;
			open.set(true);
		});
	}

	onMount(() => {
		setConfirmFunction(confirmInternal);
	});

	function handleCancel() {
		const resolve = confirmState.resolve;
		confirmState.resolve = undefined;
		confirmState.open = false;
		open.set(false);
		resolve?.(false);
	}

	function handleConfirm() {
		const resolve = confirmState.resolve;
		confirmState.resolve = undefined;
		confirmState.open = false;
		open.set(false);
		resolve?.(true);
	}

	// Sincronizar confirmState.open con $open
	$effect(() => {
		if (confirmState.open !== $open) {
			open.set(confirmState.open);
		}
	});
</script>

{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		></div>
		<div
			use:melt={$content}
			class="melt-alert-dialog fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-xl sm:max-w-lg"
			transition:scale={{ duration: 150, start: 0.95 }}
		>
			<div class="flex flex-col gap-4 pb-2">
				<h2 use:melt={$title} class="melt-alert-dialog-title font-semibold text-gray-900">
					{confirmState.title}
				</h2>
				<p use:melt={$description} class="melt-alert-dialog-desc text-gray-600">
					{confirmState.message}
				</p>
			</div>

			<div class="melt-alert-dialog-actions mt-6 flex w-full items-center justify-end gap-2">
				<button
					use:melt={$close}
					class="e-button e-button-secondary e-button-sm"
					onclick={handleCancel}
				>
					{confirmState.cancelText}
				</button>
				<button
					class="e-button e-button-sm {confirmState.danger
						? 'e-button-danger'
						: 'e-button-primary'}"
					onclick={handleConfirm}
				>
					{confirmState.confirmText}
				</button>
			</div>

			<button
				use:melt={$close}
				aria-label="Cerrar"
				class="melt-alert-dialog-close absolute top-3 right-3 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
			>
				<Close class="size-5" />
			</button>
		</div>
	</div>
{/if}
