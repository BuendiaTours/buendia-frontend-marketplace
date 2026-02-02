<script lang="ts">
	import type { BreadcrumbItem } from '$lib/types/google-maps';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';

	interface Props {
		title: string;
		breadcrumbs: BreadcrumbItem[];
	}

	let { title, breadcrumbs }: Props = $props();
</script>

<div class="flex flex-row justify-between">
	<Breadcrumb items={breadcrumbs} />
	<h2 class="text-md my-2 font-semibold">{title}</h2>
</div>
