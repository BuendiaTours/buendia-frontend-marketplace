<script lang="ts">
	import { shoppingCartStore } from '$lib/stores/shoppingCart.svelte';
	import Callout from '$lib/components/marketplace/Callout.svelte';

	type Props = { wrapperClass?: string };
	let { wrapperClass }: Props = $props();

	const CART_EXPIRY_MS = 20 * 60 * 1000;

	const cartRemainingMinutes = $derived.by(() => {
		if (!shoppingCartStore.orderId || typeof window === 'undefined') return null;
		const createdAt = localStorage.getItem('cart_created_at');
		if (!createdAt) return null;
		const remaining = Math.ceil(
			(CART_EXPIRY_MS - (Date.now() - new Date(createdAt).getTime())) / 60000
		);
		return remaining > 0 ? remaining : null;
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
				title: `Plazas reservadas durante ${cartRemainingMinutes} minuto${cartRemainingMinutes !== 1 ? 's' : ''}`,
				description: ''
			}
		]}
		{wrapperClass}
	/>
{/if}
