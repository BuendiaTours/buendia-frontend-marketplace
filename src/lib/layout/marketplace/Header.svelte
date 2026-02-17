<script lang="ts">
	type Props = {
		title?: string;
	};

	let { title = 'Mi Aplicación' }: Props = $props();
</script>

<header class="layout-header-area">
	<div class="wrapper">
		Main header {title}
	</div>
</header>
