<script lang="ts">
	import { page } from '$app/state';
	import { ROUTES } from '$lib/config/routes';

	type Props = {
		title?: string;
	};

	let { title = 'Mi Aplicación' }: Props = $props();
</script>

<header class="b-layout-header-area">
	<div class="b-wrapper">
		Main header {title}
	</div>
</header>
