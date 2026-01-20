<script lang="ts">
	// CSS global del lightbox
	import 'photoswipe/style.css';

	// CSS global del swiper
	import 'swiper/css';
	import 'swiper/css/navigation';
	import 'swiper/css/pagination';
	import 'swiper/css/scrollbar';

	// Components
	import AlertDialog from '$lib/components/AlertDialog.svelte';
	import LayoutAlertBox from '$lib/components/LayoutAlertBox.svelte';

	// Partials o elementos reutilizables
	import Header from '$lib/layout/Header.svelte';
	import Footer from '$lib/layout/Footer.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<Header title="Activities App" />

	<main class="container mx-auto flex-1 p-4">
		<LayoutAlertBox />
		{@render children()}
	</main>

	<Footer />
</div>

<AlertDialog />
