<script lang="ts">
	// CSS específico del checkout (solo Tailwind, sin DaisyUI)
	import './layout-checkout.css';

	// Layout marketplace
	import Header from '$lib/layout/marketplace/Header.svelte';
	import Footer from '$lib/layout/marketplace/Footer.svelte';
	import MeltAlertDialog from '$lib/components/MeltAlertDialog.svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_GTM_ID } from '$env/static/public';

	let { children } = $props();

	$effect(() => {
		if (!browser || !PUBLIC_GTM_ID) return;
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtm.js?id=${PUBLIC_GTM_ID}`;
		document.head.appendChild(script);
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

{#if PUBLIC_GTM_ID}
	<noscript
		><iframe
			title="Google Tag Manager"
			src="https://www.googletagmanager.com/ns.html?id={PUBLIC_GTM_ID}"
			height="0"
			width="0"
			style="display:none;visibility:hidden"
		></iframe></noscript
	>
{/if}

<div class="flex min-h-screen flex-col">
	<Header title="Checkout section" wrapperClass="my-6" />

	<main class="layout-content-area flex-1">
		<!-- MsgAlertBox /-->
		{@render children()}
	</main>

	<Footer />
	<MeltAlertDialog />
</div>
