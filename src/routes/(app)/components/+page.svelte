<script lang="ts">
	import Calendar from '$lib/components/Calendar.svelte';
	import { confirm } from '$lib/components/AlertDialog';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import { Activity, BubbleStar, Camera } from 'svelte-iconoir';

	let value = $state(today(getLocalTimeZone()));

	async function onDelete(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();

		const ok = await confirm({
			title: 'Eliminar',
			message: '¿Seguro que quieres eliminar este elemento?',
			confirmText: 'Eliminar',
			cancelText: 'Cancelar',
			danger: true
		});

		if (ok) {
			console.log('Confirm: onDelete: ✅ Confirmado');

			const target = e.target as HTMLElement;

			if (!target) {
				console.error('No target element found');
				return;
			}

			if (target.tagName === 'A') {
				const href = (target as HTMLAnchorElement).href;
				window.location.href = href;
			} else if (target.tagName === 'BUTTON') {
				const form = target.closest('form');
				if (form) {
					form.submit();
				}
			}
		} else {
			console.log('Confirm: onDelete: ❌ Cancelado');
		}
	}
</script>

<h1>Componentes</h1>
<div class="max-w-xl">
	<p>
		Los <a href="https://daisyui.com/components/">componentes de DaisyUI</a> suelen tener menos JS y ser
		más sencillos de estilar
	</p>
	<p>
		Los componentes de <a href="https://www.bits-ui.com/docs/introduction">Bits UI</a> son más complejos
		siempre pensar si es necesario integrarlos, normalmente requiere más estilado y usan JS
	</p>
</div>

<details class="collapse border border-base-300 bg-base-100" name="my-accordion-det-1" open>
	<summary class="collapse-title font-semibold">How do I create an account?</summary>
	<div class="collapse-content text-sm">
		Click the "Sign Up" button in the top right corner and follow the registration process.
	</div>
</details>
<details class="collapse border border-base-300 bg-base-100" name="my-accordion-det-1">
	<summary class="collapse-title font-semibold">I forgot my password. What should I do?</summary>
	<div class="collapse-content text-sm">
		Click on "Forgot Password" on the login page and follow the instructions sent to your email.
	</div>
</details>
<details class="collapse border border-base-300 bg-base-100" name="my-accordion-det-1">
	<summary class="collapse-title font-semibold">How do I update my profile information?</summary>
	<div class="collapse-content text-sm">
		Go to "My Account" settings and select "Edit Profile" to make changes.
	</div>
</details>

<hr />

<p>Ejemplo de calendar de Bit UI</p>
<Calendar bind:value />

<hr />

<p>Ejemplo de importción de iconos de iconoir</p>
<Activity />
<BubbleStar />
<Camera />

<hr />

<h1>Ejemplo de form submit con confirmDialog</h1>

<form action="/no-existe" method="get">
	<button type="submit" class="btn btn-outline btn-error" on:click={onDelete}>Eliminar</button>
</form>
