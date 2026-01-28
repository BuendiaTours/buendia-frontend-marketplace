<script lang="ts">
	type Pagination = {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	} | null;

	let {
		itemsLength,
		pagination
	}: {
		itemsLength: number;
		pagination: Pagination;
	} = $props();
</script>

{#if itemsLength}
	<div class="pagenav-info text-text-neutral-content text-sm">
		{#if pagination}
			Página {pagination.page} de {pagination.totalPages}, mostrando los elementos del {(pagination.page -
				1) *
				pagination.pageSize +
				1} al {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total}
		{:else}
			Mostrando {itemsLength} elementos
		{/if}
	</div>
{/if}
