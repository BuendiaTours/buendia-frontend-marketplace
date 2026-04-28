<script lang="ts">
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';
	import Callout from '$lib/components/Callout.svelte';

	type Props = { wrapperClass?: string };
	let { wrapperClass }: Props = $props();

	const CART_EXPIRY_MS = 20 * 60 * 1000;

	let tick = $state(0);

	$effect(() => {
		const interval = setInterval(() => tick++, 60_000);
		return () => clearInterval(interval);
	});

	const cartRemainingMinutes = $derived.by(() => {
		void tick;
		if (!shoppingCartStore.orderId || typeof window === 'undefined') return null;
		const createdAt = localStorage.getItem('cart_created_at');
		if (!createdAt) return null;
		const remaining = Math.ceil(
			(CART_EXPIRY_MS - (Date.now() - new Date(createdAt).getTime())) / 60000
		);
		return remaining > 0 ? remaining : null;
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

{#if cartRemainingMinutes}
	<Callout
		style="warning-high"
		size="small"
		items={[
			{
				id: 'cart-expiry',
				icon: 'History2',
				title: `Plazas reservadas durante <span class="font-bold">${cartRemainingMinutes}</span> minuto${cartRemainingMinutes !== 1 ? 's' : ''}`,
				description: ''
			}
		]}
		{wrapperClass}
	/>
{/if}
