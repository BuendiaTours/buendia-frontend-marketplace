<script lang="ts">
	// CSS específico del backoffice (DaisyUI + themes + custom)
	import './layout-backoffice.css';

	// CSS global del lightbox
	import 'photoswipe/style.css';

	// CSS global del swiper
	import 'swiper/css';
	import 'swiper/css/navigation';
	import 'swiper/css/pagination';
	import 'swiper/css/scrollbar';

	// Zod error messages in Spanish
	import { initZodErrorMap } from '$lib/config/zod-errors-es';
	initZodErrorMap();

	// Auth: client-side AuthProvider for browser API calls
	import { browser } from '$app/environment';
	import { apiClient } from '$core/_shared/client';

	// Components
	import AlertDialog from '$lib/components/backoffice/MeltAlertDialog.svelte';
	import MsgMeltToast from '$lib/components/backoffice/msg/MsgMeltToast.svelte';

	// Layout backoffice
	import Header from '$lib/layout/backoffice/Header.svelte';
	import Footer from '$lib/layout/backoffice/Footer.svelte';

	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// Key por el primer segmento después de /backoffice, para que la navegación entre
	// árboles distintos (p.ej. activities ↔ free-tours) fuerce un remount limpio y
	// evite bugs de diff en Svelte 5 con {@render children()}, pero cambiar de tab
	// dentro del mismo árbol siga reutilizando el layout.
	const routeKey = $derived(page.url.pathname.split('/')[2] ?? '');

	// Register AuthProvider for client-side (browser) API calls
	$effect(() => {
		if (browser && data.accessToken) {
			apiClient.setAuthProvider({
				getToken: async () => data.accessToken,
				formatHeaders: (token) => ({ Authorization: `Bearer ${token}` })
			});
		}
	});

	// Añadir clase al <html> cuando estamos en backoffice
	$effect(() => {
		document.documentElement.classList.add('bnd-backoffice');
		return () => {
			document.documentElement.classList.remove('bnd-backoffice');
		};
	});
</script>

<svelte:head>
	<link rel="icon" href="/backoffice/favicon.svg" type="image/svg+xml" />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Header title="Backoffice App" user={data.user} />

	<main class="backoffice-container flex-1 px-4 pb-8">
		{#key routeKey}
			{@render children()}
		{/key}
	</main>

	<Footer />
</div>

<AlertDialog />
<MsgMeltToast />
