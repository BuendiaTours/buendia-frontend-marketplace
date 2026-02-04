<script lang="ts">
	import { InfoEmpty, WarningTriangle, Cancel, CheckCircle } from 'svelte-iconoir';
	import { page } from '$app/state';

	type AlertType = 'info' | 'warning' | 'error' | 'success';

	interface AlertMessage {
		type: AlertType;
		message: string;
	}

	// Obtener el mensaje de alerta desde page.form (cuando viene de una action)
	// o desde page.data (cuando viene del load)
	const alert = $derived(
		(page.form?.alert as AlertMessage | undefined) || (page.data?.alert as AlertMessage | undefined)
	);

	const alertConfig = {
		info: {
			class: 'alert-info',
			Icon: InfoEmpty
		},
		warning: {
			class: 'alert-warning',
			Icon: WarningTriangle
		},
		error: {
			class: 'alert-error',
			Icon: Cancel
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
		<button type="button" class="btn -mt-3 -mr-3 btn-square btn-outline btn-xs" onclick={dismiss}>
			<Cancel class="size-4" />
		</button>
	</div>
{/if}
