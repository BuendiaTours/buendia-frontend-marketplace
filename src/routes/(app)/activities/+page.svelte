<script lang="ts">
	import type { ActivityListItem, Column } from '$lib/types';
	import { checkAll } from '$lib/actions/checkAll';
	import { goto } from '$app/navigation';

	// Components
	import Pagination from '$lib/components/Pagination.svelte';

	export let data: {
		items: ActivityListItem[];
		pagination: {
			page: number;
			pageSize: number;
			total: number;
			totalPages: number;
		};
	};

	const { items, pagination } = data;
	const { pageSize, total } = pagination;

	const columns: Column<ActivityListItem>[] = [
		{ key: 'title' },
		{ key: 'city' },
		{ key: 'priceFrom' },
		{ key: 'currency' }
	];

	function handlePageChange(newPage: number) {
		goto(`/activities?page=${newPage}&pageSize=${pageSize}`);
	}
</script>

<h1>Actividades</h1>

<p><a href="/">← Volver a la home</a></p>

{#if items.length}
	<table class="table table-xs">
		<thead>
			<tr>
				<th><input type="checkbox" class="checkbox checkbox-sm" use:checkAll /></th>
				<th>Id</th>
				{#each columns as col}
					<th>{col.key}</th>
				{/each}
				<th>Actions</th>
			</tr>
		</thead>

		<tbody>
			{#each items as item}
				<tr>
					<td>
						<input
							type="checkbox"
							name="activities_selected[]"
							value={item.id}
							id={item.id}
							class="checkbox checkbox-sm"
						/>
					</td>
					<td>
						{item.id}
					</td>
					{#each columns as col}
						<td>
							{#if col.key === 'title'}
								<a href={`/activities/${item.slug}`}>
									{item[col.key]}
								</a>
							{:else}
								{item[col.key]}
							{/if}
						</td>
					{/each}
					<td
						><div class="dropdown dropdown-end dropdown-bottom">
							<div tabindex="0" role="button" class="btn m-1">Actions</div>
							<ul
								tabindex="-1"
								class="dropdown-content menu z-1 w-52 rounded-box bg-base-100 p-2 shadow-sm"
							>
								<li><a href={`/activities/${item.slug}`}>View</a></li>
								<li><a href={`/activities/${item.slug}/edit`}>Edit</a></li>
								<li><a href={`/activities/${item.slug}/delete`}>Delete</a></li>
							</ul>
						</div></td
					>
				</tr>
			{/each}
		</tbody>
	</table>

	<Pagination count={total} perPage={pageSize} onPageChange={handlePageChange} />
{:else}
	<p>No hay actividades.</p>
{/if}
