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
	import { Cancel } from 'svelte-iconoir';

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
		elements: { trigger, overlay, content, title, description, close, portalled },
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
		/>
		<div
			use:melt={$content}
			class="fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-box border border-base-300 bg-base-100 p-6 shadow-xl sm:max-w-lg"
			transition:scale={{ duration: 150, start: 0.95 }}
		>
			<div class="flex flex-col gap-4 pb-2">
				<h2 use:melt={$title} class="text-lg font-semibold">
					{confirmState.title}
				</h2>
				<p use:melt={$description} class="text-sm opacity-80">
					{confirmState.message}
				</p>
			</div>

			<div class="mt-6 flex w-full items-center justify-end gap-2">
				<button use:melt={$close} class="btn btn-ghost btn-sm" onclick={handleCancel}>
					{confirmState.cancelText}
				</button>
				<button
					class="btn btn-sm {confirmState.danger ? 'btn-error' : 'btn-primary'}"
					onclick={handleConfirm}
				>
					{confirmState.confirmText}
				</button>
			</div>

			<button
				use:melt={$close}
				aria-label="Cerrar"
				class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm"
			>
				<Cancel class="size-4" />
			</button>
		</div>
	</div>
{/if}
