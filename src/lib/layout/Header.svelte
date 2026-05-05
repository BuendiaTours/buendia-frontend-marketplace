<script lang="ts">
	import ShoppingCart from '$lib/components/ShoppingCart/index.svelte';
	import { UserCircle } from '$lib/icons/Linear';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import { page } from '$app/state';

	type Props = {
		wrapperClass?: string;
	};

	let { wrapperClass }: Props = $props();
</script>

<header class="layout-header-area {wrapperClass}">
	<div class="wrapper flex items-center justify-between gap-5">
		<div class="flex flex-[0_1_100%] items-center justify-between gap-6 lg:flex-none">
			<a href="/">
				<img src="buendia-logo.svg" alt="Buendía" class="h-[27px]" />
			</a>

			{#if page.url.pathname !== '/'}
				<SearchBar isHeader={true} />
			{/if}
		</div>

		<div class="flex items-center gap-5">
			<ShoppingCart />

			<button type="button" class="flex gap-2">
				<UserCircle class="size-6" />
				<p class="p-lg hidden whitespace-nowrap sm:block">Mi perfil</p>
			</button>
		</div>
	</div>
</header>
