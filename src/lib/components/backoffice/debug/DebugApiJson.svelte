<script lang="ts">
	/**
	 * Componente de debug para mostrar el JSON de la API
	 * Útil durante el desarrollo para inspeccionar los datos
	 *
	 * @param data - Objeto a mostrar en formato JSON
	 * @param title - (Opcional) Título del bloque de debug
	 */

	interface Props {
		data: any;
		title?: string;
	}

	let { data, title = 'JSON de la API' }: Props = $props();
</script>

<details class="bg-base-100 collapse" name="my-accordion-det-1">
	<summary class="collapse-title text-xs font-semibold">{title}</summary>
	<div class="collapse-content text-sm">
		<pre class="rounded-box bg-base-200 overflow-x-auto p-4 text-xs">{JSON.stringify(
				data,
				null,
				2
			)}</pre>
	</div>
</details>
