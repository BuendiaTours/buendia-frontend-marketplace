<script lang="ts">
	import ShoppingCart from '$lib/components/ShoppingCart/index.svelte';
	import { UserCircle } from '$lib/icons/Linear';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import { page } from '$app/state';

	type Props = {
		wrapperClass?: string;
	};

	let { wrapperClass }: Props = $props();

	const isCheckout = $derived(page.url.pathname.startsWith('/checkout'));
</script>

<header
	class="layout-header-area {wrapperClass} {isCheckout
		? 'mb-7 border-b border-solid border-neutral-200 sm:mb-9 lg:mb-12'
		: ''}"
>
	<div class="wrapper flex items-center justify-between gap-5">
		<div class="flex flex-[0_1_100%] items-center justify-between gap-6 lg:flex-none">
			<a href="/">
				<img src="/buendia-logo.svg" alt="Buendía" class="h-[27px]" />
			</a>

			{#if page.url.pathname !== '/' && !isCheckout}
				<SearchBar isHeader={true} />
			{/if}
		</div>

		{#if !isCheckout}
			<div class="flex items-center gap-5">
				<ShoppingCart />

				<button type="button" class="flex gap-2">
					<UserCircle class="size-6" />
					<p class="p-lg hidden whitespace-nowrap sm:block">Mi perfil</p>
				</button>
			</div>
		{/if}
	</div>
</header>
