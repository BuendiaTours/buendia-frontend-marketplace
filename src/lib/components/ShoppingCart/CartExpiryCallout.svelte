<script lang="ts">
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';
	import Callout from '$lib/components/Callout.svelte';

	type Props = { wrapperClass?: string };
	let { wrapperClass }: Props = $props();

	const CART_EXPIRY_MS = 20 * 60 * 1000;

	let tick = $state(0);

	$effect(() => {
		const interval = setInterval(() => tick++, 1_000);
		return () => clearInterval(interval);
	});

	const cartRemainingTime = $derived.by(() => {
		void tick;
		if (!shoppingCartStore.orderId || typeof window === 'undefined') return null;
		const createdAt = localStorage.getItem('cart_created_at');
		if (!createdAt) return null;
		const remainingMs = CART_EXPIRY_MS - (Date.now() - new Date(createdAt).getTime());
		if (remainingMs <= 0) return null;
		const totalSeconds = Math.ceil(remainingMs / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	});

	$effect(() => {
		void tick;
		if (!shoppingCartStore.orderId || typeof window === 'undefined') return;
		const createdAt = localStorage.getItem('cart_created_at');
		if (!createdAt) return;
		if (Date.now() - new Date(createdAt).getTime() >= CART_EXPIRY_MS) {
			shoppingCartStore.clearShoppingCart();
		}
	});
</script>

{#if cartRemainingTime}
	<Callout
		style="warning-high"
		size="small"
		items={[
			{
				icon: 'History2',
				title: `Plazas reservadas durante <span class="font-bold">${cartRemainingTime}</span> minutos`,
				description: ''
			}
		]}
		{wrapperClass}
	/>
{/if}
