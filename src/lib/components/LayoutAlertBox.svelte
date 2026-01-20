<script lang="ts">
	import { InfoEmpty, WarningTriangle, Cancel, CheckCircle } from 'svelte-iconoir';
	import { page } from '$app/stores';

	type AlertType = 'info' | 'warning' | 'error' | 'success';

	interface AlertMessage {
		type: AlertType;
		message: string;
	}

	// Obtener el mensaje de alerta desde $page.form (cuando viene de una action)
	// o desde $page.data (cuando viene del load)
	const alert = $derived(
		($page.form?.alert as AlertMessage | undefined) ||
			($page.data?.alert as AlertMessage | undefined)
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
</script>

{#if alert && config && IconComponent}
	<div role="alert" class="alert {config.class} mb-4">
		<IconComponent class="size-6 shrink-0" />
		<span>{alert.message}</span>
	</div>
{/if}
