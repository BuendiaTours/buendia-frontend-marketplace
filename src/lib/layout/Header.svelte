<script lang="ts">
	import ShoppingCart from '$lib/components/ShoppingCart/index.svelte';
	import { UserCircle } from '$lib/icons/Linear';

	type Props = {
		wrapperClass?: string;
	};

	let { wrapperClass }: Props = $props();
</script>

<header class="layout-header-area {wrapperClass}">
	<div class="wrapper flex items-center justify-between">
		<a href="/">
			<img src="buendia-logo.svg" alt="Buendía" class="h-[27px]" />
		</a>

		<div class="flex items-center gap-5">
			<ShoppingCart />

			<button type="button" class="flex gap-2">
				<UserCircle class="size-6" />
				<p class="p-lg hidden sm:block">Mi perfil</p>
			</button>
		</div>
	</div>
</header>
