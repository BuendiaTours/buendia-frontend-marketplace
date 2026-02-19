<script lang="ts">
	/**
	 * ThemeSwitcher - Toggle entre dark y light mode
	 *
	 * Características:
	 * - Usa theme-change para persistencia en localStorage
	 * - Iconos de @solar-icons/svelte (Sun, Moon)
	 * - Swap animado de DaisyUI
	 * - Estado reactivo con MutationObserver
	 */
	import { onMount } from 'svelte';
	import { themeChange } from 'theme-change';
	import { Sun, Moon } from '$lib/icons/Linear';

	// Estado reactivo del tema actual
	let currentTheme = $state<string>('dark');

	// Inicializar theme-change
	onMount(() => {
		themeChange(false); // false es requerido para Svelte

		// Leer tema actual del HTML
		currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
	});

	// Observar cambios en data-theme del HTML
	$effect(() => {
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.attributeName === 'data-theme') {
					currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
				}
			});
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});
		return () => observer.disconnect();
	});

	const isDark = $derived(currentTheme === 'dark');
</script>

<!-- Toggle con Swap de DaisyUI -->
<label class="btn swap btn-square swap-rotate btn-sm">
	<!-- Checkbox invisible que controla el swap -->
	<input
		type="checkbox"
		class="bg-none"
		data-toggle-theme="light,dark"
		data-act-class="swap-active"
		checked={isDark}
	/>
	<!-- Icono Sol (aparece cuando está en LIGHT) -->
	<Sun class="swap-on size-6" />
	<!-- Icono Luna (aparece cuando está en DARK) -->
	<Moon class="swap-off size-6" />
</label>
