<script lang="ts">
	import Calendar from '$lib/components/Calendar.svelte';
	import { getLocalTimeZone, today } from '@internationalized/date';

	let value = $state(today(getLocalTimeZone()));
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

<Calendar bind:value />
