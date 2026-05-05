<script lang="ts">
	import { Magnifier, AltArrowLeft } from '$lib/icons/Linear';
	import { goto } from '$app/navigation';
	import type {
		DistributiveSearchItem,
		DistributiveSearchResponse
	} from '$core/distributives/types';

	type Props = {
		isHeader?: boolean;
		wrapperClass?: string;
		ref?: HTMLDivElement;
	};

	let { isHeader, wrapperClass, ref = $bindable() }: Props = $props();

	let query = $state('');
	let suggestions = $state<DistributiveSearchItem[]>([]);
	let open = $state(false);
	let overlayOpen = $state(false);
	let isMobile = $state(false);
	let mobileInputEl: HTMLInputElement | null = $state(null);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		const mq = window.matchMedia('(max-width: 1024px)');
		isMobile = mq.matches;
		const handler = (e: MediaQueryListEvent) => (isMobile = e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});

	$effect(() => {
		if (overlayOpen && mobileInputEl) {
			mobileInputEl.focus();
		}
	});

	function handleInput(e: Event) {
		query = (e.target as HTMLInputElement).value;

		if (debounceTimer) clearTimeout(debounceTimer);

		if (!query.trim()) {
			suggestions = [];
			open = false;
			return;
		}

		debounceTimer = setTimeout(async () => {
			const res = await fetch(
				`/api/distributives/search?query=${encodeURIComponent(query.trim())}&limit=8`
			);
			if (res.ok) {
				const data: DistributiveSearchResponse = await res.json();
				suggestions = data.data.map((r) => r.item);
				open = suggestions.length > 0;
			}
		}, 300);
	}

	function handleBlur() {
		setTimeout(() => {
			open = false;
		}, 150);
	}

	function reset() {
		query = '';
		suggestions = [];
		open = false;
	}

	function openSearch() {
		if (isMobile) overlayOpen = true;
	}

	function handleSearchButton() {
		openSearch();
		if (!isMobile && suggestions.length > 0) {
			goto(`/${suggestions[0].slug}`);
			reset();
		}
	}

	function closeOverlay() {
		overlayOpen = false;
		reset();
	}
</script>

<div
	bind:this={ref}
	class="relative flex items-center gap-3 rounded-lg border-solid border-neutral-300 bg-white {isHeader
		? 'border-0 lg:min-w-110 lg:border lg:py-1.5 lg:pr-1.5 lg:pl-3'
		: 'border py-2 pr-2 pl-5'} {wrapperClass ?? ''}"
>
	{#if isHeader}
		<button type="button" onclick={() => openSearch()} class="flex-shrink-0" tabindex="-1">
			<Magnifier class="size-6 text-neutral-800 lg:size-5 lg:text-neutral-600" />
		</button>
	{/if}
	<input
		type="text"
		value={query}
		oninput={handleInput}
		onblur={handleBlur}
		onfocus={() => {
			if (!isMobile && suggestions.length > 0) open = true;
			openSearch();
		}}
		onkeydown={(e) => {
			if (e.key === 'Enter') handleSearchButton();
		}}
		class="flex-[0_1_100%] border-0 p-0 placeholder:text-neutral-600 focus:border-transparent focus:ring-0 focus:outline-none {isHeader
			? 'hidden lg:block'
			: ''}"
		placeholder="Busca destinos"
		autocomplete="off"
	/>
	<button
		type="button"
		onclick={handleSearchButton}
		class="e-button flex-shrink-0 {isHeader ? 'e-button-sm !hidden lg:!inline' : ''}">Buscar</button
	>

	{#if open && !isMobile}
		<div
			class="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white px-6 py-4 shadow-md lg:w-max"
		>
			{@render resultsList()}
		</div>
	{/if}
</div>

{#if overlayOpen}
	<div class="fixed inset-0 z-[100] flex flex-col bg-white">
		<div class="flex items-center gap-1 pt-4 pr-4 pl-1">
			<button type="button" onclick={closeOverlay} class="-ml-1 flex-shrink-0 p-3">
				<AltArrowLeft size={24} />
			</button>
			<div class="flex flex-1 items-center gap-2 rounded-xl border border-neutral-300 px-3 py-3">
				<Magnifier size={18} class="flex-shrink-0 text-neutral-400" />
				<input
					bind:this={mobileInputEl}
					type="text"
					value={query}
					oninput={handleInput}
					class="flex-1 border-0 p-0 placeholder:text-neutral-600 focus:border-transparent focus:ring-0 focus:outline-none"
					placeholder="Busca destinos"
					autocomplete="off"
				/>
			</div>
		</div>
		<div class="flex-1 overflow-y-auto px-4 py-4">
			{@render resultsList()}
		</div>
	</div>
{/if}

{#snippet resultsList()}
	{#if suggestions.length > 0}
		<p class="h4 mb-4 text-neutral-800">Sugerencias de búsqueda</p>
		<ul class="grid grid-cols-1 gap-4 {isHeader ? '' : 'lg:grid-cols-2'}">
			{#each suggestions as item (item.id)}
				<li>
					<a href="/{item.slug}" class="flex w-full items-center gap-4 text-left">
						{#if item.thumbnailUrl || item.cardImageUrl}
							<img
								src={item.thumbnailUrl ?? item.cardImageUrl}
								alt={item.name}
								class="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
							/>
						{:else}
							<div class="h-16 w-16 flex-shrink-0 rounded-xl bg-neutral-100"></div>
						{/if}
						<div class="flex flex-col gap-1">
							<p class="h3-editorial text-neutral-800">{item.name}</p>
							<p class="p-base text-neutral-600">32 actividades</p>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
{/snippet}
