<script lang="ts">
	import type { ActivityDetail } from '$lib/types';
	import type { ActionData } from './$types';

	export let data: { activity: ActivityDetail };
	export let form: ActionData;

	const { activity } = data;
</script>

<h1>Editar Actividad</h1>

<p>
	<a href={`/activities/${activity.slug}`}>← Volver al detalle</a>
</p>

{#if form?.error}
	<div class="mb-4 alert alert-outline alert-error">
		<span>{form.error}</span>
	</div>
{/if}

<form method="POST" class="max-w-2xl">
	<div class="form-control mb-4">
		<label class="label" for="title">
			<span class="label-text">Título</span>
		</label>
		<input
			type="text"
			id="title"
			name="title"
			class="input input-sm w-full"
			value={form?.values?.title ?? activity.title}
			required
		/>
	</div>

	<div class="form-control mb-4">
		<label class="label" for="city">
			<span class="label-text">Ciudad</span>
		</label>
		<input
			type="text"
			id="city"
			name="city"
			class="input input-sm w-full"
			value={form?.values?.city ?? activity.city}
			required
		/>
	</div>

	<div class="mb-4 grid grid-cols-2 gap-4">
		<div class="form-control">
			<label class="label" for="priceFrom">
				<span class="label-text">Precio desde</span>
			</label>
			<input
				type="number"
				id="priceFrom"
				name="priceFrom"
				class="input input-sm w-full"
				value={form?.values?.priceFrom ?? activity.priceFrom}
				min="0"
				step="0.01"
				required
			/>
		</div>

		<div class="form-control">
			<label class="label" for="currency">
				<span class="label-text">Moneda</span>
			</label>
			<select
				id="currency"
				name="currency"
				class="select w-full select-sm"
				value={form?.values?.currency ?? activity.currency}
				required
			>
				<option value="EUR">EUR</option>
				<option value="USD">USD</option>
				<option value="GBP">GBP</option>
			</select>
		</div>
	</div>

	<div class="form-control mb-4">
		<label class="label" for="description">
			<span class="label-text">Descripción</span>
		</label>
		<textarea
			id="description"
			name="description"
			class="textarea w-full textarea-sm"
			rows="5"
			required>{form?.values?.description ?? activity.description}</textarea
		>
	</div>

	<div class="flex gap-2">
		<button type="submit" class="btn btn-primary">Guardar cambios</button>
		<a href={`/activities/${activity.slug}`} class="btn btn-ghost">Cancelar</a>
	</div>
</form>
