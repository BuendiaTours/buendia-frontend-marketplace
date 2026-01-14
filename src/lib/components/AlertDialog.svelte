<!-- https://www.bits-ui.com/docs/components/alert-dialog -->
<script lang="ts">
	import { AlertDialog } from 'bits-ui';
	import { setConfirmFunction } from './AlertDialog';
	import { onMount } from 'svelte';

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

	function confirmInternal(opts: {
		title?: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		danger?: boolean;
	}): Promise<boolean> {
		return new Promise((resolve) => {
			confirmState.open = true;
			confirmState.title = opts.title ?? 'Confirmar';
			confirmState.message = opts.message;
			confirmState.confirmText = opts.confirmText ?? 'Aceptar';
			confirmState.cancelText = opts.cancelText ?? 'Cancelar';
			confirmState.danger = opts.danger ?? false;
			confirmState.resolve = resolve;
		});
	}

	onMount(() => {
		setConfirmFunction(confirmInternal);
	});

	function handleCancel() {
		confirmState.open = false;
		confirmState.resolve?.(false);
		confirmState.resolve = undefined;
	}

	function handleConfirm() {
		confirmState.open = false;
		confirmState.resolve?.(true);
		confirmState.resolve = undefined;
	}
</script>

<AlertDialog.Root bind:open={confirmState.open}>
	<AlertDialog.Portal>
		<AlertDialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"
		/>
		<AlertDialog.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-box border border-base-300 bg-base-100 p-6 shadow-xl sm:max-w-lg md:w-full"
		>
			<div class="flex flex-col gap-4 pb-2">
				<AlertDialog.Title class="text-lg font-semibold">
					{confirmState.title}
				</AlertDialog.Title>
				<AlertDialog.Description class="text-sm opacity-80">
					{confirmState.message}
				</AlertDialog.Description>
			</div>
			<div class="flex w-full items-center justify-end gap-2">
				<AlertDialog.Cancel class="btn btn-ghost btn-sm" onclick={handleCancel}>
					{confirmState.cancelText}
				</AlertDialog.Cancel>
				<AlertDialog.Action
					class="btn btn-sm {confirmState.danger ? 'btn-error' : 'btn-primary'}"
					onclick={handleConfirm}
				>
					{confirmState.confirmText}
				</AlertDialog.Action>
			</div>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>
