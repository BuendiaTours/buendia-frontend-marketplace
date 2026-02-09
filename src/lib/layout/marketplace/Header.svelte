<script lang="ts">
	import { page } from '$app/state';
	import { ROUTES } from '$lib/config/routes';

	type Props = {
		title?: string;
	};

	let { title = 'Mi Aplicación' }: Props = $props();
</script>

<header class="navbar border-base-content/10 bg-base-100 border-b">
	Main header {title}
</header>
