<script lang="ts">
	/**
	 * FormAsyncSearch - Generic debounced async search select for forms.
	 * Fetches results from an external source after a configurable debounce delay.
	 *
	 * @example
	 * ```svelte
	 * <FormAsyncSearch
	 *   id="parentId"
	 *   label="Ubicación padre"
	 *   placeholder="Buscar ubicación..."
	 *   bind:value={$form.parentId}
	 *   searchFn={async (query) => {
	 *     const res = await fetch(`${API}/locations?query=${query}&limit=10`);
	 *     const data = await res.json();
	 *     return data.data.map(loc => ({ value: loc.id, label: loc.name, subtitle: loc.kind }));
	 *   }}
	 *   loadSelectedFn={async (id) => {
	 *     const res = await fetch(`${API}/locations/${id}`);
	 *     const data = await res.json();
	 *     return { value: data.id, label: data.name };
	 *   }}
	 * />
	 * ```
	 */
	import * as m from '$paraglide/messages';
	import { Close } from '$lib/icons/Linear';
	import FormErrorMsg from './FormErrorMsg.svelte';
	import { tick } from 'svelte';

	export type SearchResult = {
		value: string;
		label: string;
		subtitle?: string;
		image?: string;
	};

	type Props = {
		id: string;
		label: string;
		value: string | undefined;
		searchFn: (query: string) => Promise<SearchResult[]>;
		loadSelectedFn?: (value: string) => Promise<SearchResult | undefined>;
		initialLabel?: string | null;
		excludeValue?: string;
		placeholder?: string;
		error?: string | string[];
		debounceMs?: number;
		minChars?: number;
		wrapperClass?: string;
	};

	let {
		id,
		label: fieldLabel,
		value = $bindable(),
		searchFn,
		loadSelectedFn,
		initialLabel,
		excludeValue,
		placeholder = m.common_search(),
		error,
		debounceMs = 500,
		minChars = 2,
		wrapperClass = 'md:col-span-12'
	}: Props = $props();

	let searchQuery = $state('');
	let results = $state<SearchResult[]>([]);
	let isLoading = $state(false);
	let isOpen = $state(false);
	let inputElement: HTMLInputElement | undefined = $state();
	let dropdownStyle = $state('');
	// svelte-ignore state_referenced_locally
	let selectedLabel = $state(initialLabel ?? '');
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let focusoutTimer: ReturnType<typeof setTimeout> | undefined;
	let searchVersion = 0;

	$effect(() => {
		if (initialLabel) selectedLabel = initialLabel;
	});

	$effect(() => {
		if (!value) {
			selectedLabel = '';
			searchQuery = '';
		} else if (!selectedLabel && loadSelectedFn) {
			loadSelectedFn(value).then((result) => {
				if (result) selectedLabel = result.label;
			});
		}
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;

		if (debounceTimer) clearTimeout(debounceTimer);
		if (focusoutTimer) clearTimeout(focusoutTimer);
		searchVersion++;

		if (searchQuery.length < minChars) {
			results = [];
			isOpen = false;
			isLoading = false;
			return;
		}

		isLoading = true;
		const currentVersion = searchVersion;
		debounceTimer = setTimeout(() => search(searchQuery, currentVersion), debounceMs);
	}

	async function search(query: string, version: number) {
		try {
			let items = await searchFn(query);
			if (version !== searchVersion) return;
			if (excludeValue) {
				items = items.filter((item) => item.value !== excludeValue);
			}
			results = items;
			isOpen = results.length > 0;
			if (isOpen) updateDropdownPosition();
		} catch {
			if (version !== searchVersion) return;
			results = [];
		} finally {
			if (version === searchVersion) {
				isLoading = false;
			}
		}
	}

	function select(item: SearchResult) {
		value = item.value;
		selectedLabel = item.label;
		searchQuery = '';
		results = [];
		isOpen = false;
	}

	function updateDropdownPosition() {
		if (!inputElement) return;
		const rect = inputElement.getBoundingClientRect();
		dropdownStyle = `position: fixed; top: ${rect.bottom + 4}px; left: ${rect.left}px; width: ${rect.width}px;`;
	}

	function clear() {
		value = undefined;
		selectedLabel = '';
		searchQuery = '';
		results = [];
		isOpen = false;
	}
</script>

<div class="{wrapperClass} relative">
	<label class="label text-sm" for={id}>
		<span>{fieldLabel}</span>
	</label>

	{#if selectedLabel}
		<div class="input flex w-full items-center justify-between">
			<span>{selectedLabel}</span>
			<button type="button" class="btn btn-ghost btn-xs" onclick={clear}>
				<Close class="size-4" />
			</button>
		</div>
		<input type="hidden" name={id} {value} />
	{:else}
		<div class="relative">
			<input
				bind:this={inputElement}
				type="text"
				{id}
				class="input w-full"
				class:input-error={error}
				{placeholder}
				value={searchQuery}
				oninput={handleInput}
				onfocusin={updateDropdownPosition}
				onfocusout={() => {
					if (focusoutTimer) clearTimeout(focusoutTimer);
					focusoutTimer = setTimeout(() => (isOpen = false), 200);
				}}
				autocomplete="off"
			/>

			{#if isLoading}
				<div class="absolute top-1/2 right-3 -translate-y-1/2">
					<span class="loading loading-spinner loading-xs"></span>
				</div>
			{/if}
		</div>

		{#if isOpen}
			<ul
				class="menu rounded-box bg-base-100 z-50 max-h-60 overflow-y-auto border shadow-lg"
				style={dropdownStyle}
			>
				{#each results as item (item.value)}
					<li>
						<button type="button" class="flex items-center gap-2" onmousedown={() => select(item)}>
							{#if item.image}
								<img
									src={item.image}
									alt={item.label}
									class="h-8 w-8 shrink-0 rounded object-cover"
								/>
							{/if}
							<div class="flex flex-col items-start">
								<span class="font-medium">{item.label}</span>
								{#if item.subtitle}
									<span class="text-base-content/50 text-xs">{item.subtitle}</span>
								{/if}
							</div>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}

	<FormErrorMsg {error} />
</div>
