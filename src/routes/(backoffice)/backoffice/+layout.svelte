<script lang="ts">
	// CSS global del lightbox
	import 'photoswipe/style.css';

	// CSS global del swiper
	import 'swiper/css';
	import 'swiper/css/navigation';
	import 'swiper/css/pagination';
	import 'swiper/css/scrollbar';

	// Components
	// import MsgAlertBox from '$lib/components/msg/MsgAlertBox.svelte';
	import AlertDialog from '$lib/components/MeltAlertDialog.svelte';
	import MsgMeltToast from '$lib/components/msg/MsgMeltToast.svelte';

	// Partials o elementos reutilizables
	import Header from '$lib/layout/Header.svelte';
	import Footer from '$lib/layout/Footer.svelte';

	let { children } = $props();

	// Añadir clase al <html> cuando estamos en backoffice
	$effect(() => {
		document.documentElement.classList.add('bnd-backoffice');
		return () => {
			document.documentElement.classList.remove('bnd-backoffice');
		};
	});
</script>

<div class="flex min-h-screen flex-col">
	<Header title="Backoffice App" />

	<main class="backoffice-container flex-1 px-4">
		<!-- MsgAlertBox /-->
		{@render children()}
	</main>

	<Footer />
</div>

<AlertDialog />
<MsgMeltToast />
