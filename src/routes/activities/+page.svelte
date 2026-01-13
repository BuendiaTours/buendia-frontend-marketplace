<script lang="ts">
	import type { ActivityListItem, Column } from '$lib/types';
	import { confirm } from '$lib/ui/confirm.svelte';
	import { checkAll } from '$lib/actions/checkAll';

	// Components
	import Pagination from '$lib/components/Pagination.svelte';

	export let data: {
		items: ActivityListItem[];
		pagination: {
			page: number;
			pageSize: number;
			totalPages: number;
		};
	};

	async function onDelete(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();

		const ok = await confirm({
			title: 'Eliminar',
			message: '¿Seguro que quieres eliminar este elemento?',
			confirmText: 'Eliminar',
			cancelText: 'Cancelar',
			danger: true
		});

		if (ok) {
			console.log('Confirm: onDelete: ✅ Confirmado');

			const target = e.target as HTMLElement;

			if (!target) {
				console.error('No target element found');
				return;
			}

			if (target.tagName === 'A') {
				const href = (target as HTMLAnchorElement).href;
				window.location.href = href;
			} else if (target.tagName === 'BUTTON') {
				const form = target.closest('form');
				if (form) {
					form.submit();
				}
			}
		} else {
			console.log('Confirm: onDelete: ❌ Cancelado');
		}
	}

	const { items, pagination } = data;
	const { page, pageSize, totalPages } = pagination;

	const columns: Column<ActivityListItem>[] = [
		{ key: 'title' },
		{ key: 'city' },
		{ key: 'priceFrom' },
		{ key: 'currency' }
	];
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
								<li><a href={`/activities/${item.slug}/delete`} on:click={onDelete}>Delete</a></li>
							</ul>
						</div></td
					>
				</tr>
			{/each}
		</tbody>
	</table>

	<Pagination {page} {pageSize} {totalPages} basePath="/activities" />
{:else}
	<p>No hay actividades.</p>
{/if}

<hr class="mt-6" />

<h1>Ejemplo de form submit con confirmDialog</h1>

<form action="/no-existe" method="get">
	<button type="submit" class="btn btn-outline btn-error" on:click={onDelete}>Eliminar</button>
</form>
