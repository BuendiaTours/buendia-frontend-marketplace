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

	// Components
	import AlertDialog from '$lib/components/backoffice/MeltAlertDialog.svelte';
	import MsgMeltToast from '$lib/components/backoffice/msg/MsgMeltToast.svelte';

	// Layout backoffice
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
