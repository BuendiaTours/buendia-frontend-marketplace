<script lang="ts">
	import { page } from '$app/state';
	import { ROUTES } from '$lib/config/routes';

	type Props = {
		title?: string;
	};

	let { title = 'Mi Aplicación' }: Props = $props();
</script>

<header class="bnd-main-header">
	<div class="bnd-container">
		Main header {title}
	</div>
</header>
