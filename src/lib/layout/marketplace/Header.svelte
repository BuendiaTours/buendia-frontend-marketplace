<script lang="ts">
	type Props = {
		title?: string;
		wrapperClass?: string;
	};

	let { title = 'Mi Aplicación', wrapperClass }: Props = $props();
</script>

<header class="layout-header-area {wrapperClass}">
	<div class="wrapper">
		Main header {title}
	</div>
</header>
