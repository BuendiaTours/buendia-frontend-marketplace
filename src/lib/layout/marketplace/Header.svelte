<script lang="ts">
	import ShoppingCart from '$lib/components/marketplace/ShoppingCart/index.svelte';

	type Props = {
		title?: string;
		wrapperClass?: string;
	};

	let { title = 'Mi Aplicación', wrapperClass }: Props = $props();
</script>

<header class="layout-header-area {wrapperClass}">
	<div class="wrapper flex items-center justify-between">
		Main header {title}

		<ShoppingCart />
	</div>
</header>
