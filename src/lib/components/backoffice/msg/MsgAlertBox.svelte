<script lang="ts">
	import { InfoCircle, DangerTriangle, CloseSquare, CheckCircle } from '$lib/icons/Linear';
	import { page } from '$app/state';

	type AlertType = 'info' | 'warning' | 'error' | 'success';

	type AlertMessage = {
		type: AlertType;
		message: string;
	};

	// Obtener el mensaje de alerta desde page.form (cuando viene de una action)
	// o desde page.data (cuando viene del load)
	const alert = $derived(
		(page.form?.alert as AlertMessage | undefined) || (page.data?.alert as AlertMessage | undefined)
	);

	const alertConfig = {
		info: {
			class: 'alert-info',
			Icon: InfoCircle
		},
		warning: {
			class: 'alert-warning',
			Icon: DangerTriangle
		},
		error: {
			class: 'alert-error',
			Icon: CloseSquare
		},
		success: {
			class: 'alert-success',
			Icon: CheckCircle
		}
	};

	const config = $derived(alert ? alertConfig[alert.type] : null);
	const IconComponent = $derived(config?.Icon);

	let dismissed = $state(false);

	function dismiss() {
		dismissed = true;
	}

	// Reset dismissed cuando cambia el mensaje
	$effect(() => {
		if (alert) {
			dismissed = false;
		}
	});
</script>

{#if alert && config && IconComponent && !dismissed}
	<div role="alert" class="alert {config.class} mb-4">
		<IconComponent class="size-6 shrink-0" />
		<span class="flex-1">{alert.message}</span>
		<button type="button" class="btn btn-square btn-outline btn-xs -mt-3 -mr-3" onclick={dismiss}>
			<CloseSquare class="size-4" />
		</button>
	</div>
{/if}
