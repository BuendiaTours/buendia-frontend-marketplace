<script lang="ts">
	type Props = {
		page: number;
		pageSize: number;
		totalPages: number;
		basePath?: string;
	};

	let { page, pageSize, totalPages, basePath = '' } = $props<Props>();
</script>

<nav>
	{#if page > 1}
		<a href={`${basePath}?page=${page - 1}&pageSize=${pageSize}`}>Anterior</a>
	{/if}

	<span> Página {page} de {totalPages} </span>

	{#if page < totalPages}
		<a href={`${basePath}?page=${page + 1}&pageSize=${pageSize}`}>Siguiente</a>
	{/if}
</nav>
