<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';
	import { CheckCircle, CloseCircle, Refresh } from '$lib/icons/Linear';
	import { slugify } from '$lib/utils/strings';

	/**
	 * Reusable slug input with auto-generation and optional availability check.
	 *
	 * @example
	 * ```svelte
	 * <FormInputSlug
	 *   id="slug"
	 *   label="Slug"
	 *   bind:value={$form.slug}
	 *   sourceValue={$form.title}
	 *   error={$errors.slug}
	 *   checkSlugFn={async (slug) => {
	 *     const res = await fetch(`/api/slugs/${slug}/exists`);
	 *     const data = await res.json();
	 *     return !data.exists;
	 *   }}
	 * />
	 * ```
	 */

	type Props = {
		id: string;
		label: string;
		value: string;
		sourceValue: string;
		error?: string | string[];
		badge?: string;
		generateTooltip?: string;
		disabled?: boolean;
		wrapperClass?: string;
		/** Async function that returns true if the slug is available. */
		checkSlugFn?: (slug: string) => Promise<boolean>;
		[key: string]: unknown;
	};

	let {
		id,
		label,
		value = $bindable(),
		sourceValue,
		error,
		badge,
		generateTooltip = 'Genera slug automáticamente',
		disabled = false,
		wrapperClass = 'md:col-span-12',
		checkSlugFn,
		...restProps
	}: Props = $props();

	let checking = $state(false);
	let slugStatus = $state<'available' | 'taken' | null>(null);

	/** Reset status when the user types */
	function handleInput() {
		slugStatus = null;
	}

	async function handleCheck() {
		if (!value && sourceValue) {
			value = slugify(sourceValue);
		}
		if (!value) return;

		if (!checkSlugFn) {
			// No check function — just regenerate
			if (sourceValue) value = slugify(sourceValue);
			return;
		}

		checking = true;
		slugStatus = null;
		try {
			const available = await checkSlugFn(value);
			slugStatus = available ? 'available' : 'taken';
		} catch {
			slugStatus = null;
		} finally {
			checking = false;
		}
	}
</script>

<div class={wrapperClass}>
	<label class="label flex items-center justify-between text-sm" for={id}>
		<span>{label}</span>
		{#if badge}
			<span class="text-xs opacity-70">{badge}</span>
		{/if}
	</label>
	<div class="flex gap-2">
		<div class="relative w-full">
			<input
				type="text"
				{id}
				name={id}
				class="input w-full"
				class:input-error={error || slugStatus === 'taken'}
				class:input-success={slugStatus === 'available'}
				bind:value
				oninput={handleInput}
				{disabled}
				{...restProps}
			/>
			{#if slugStatus === 'available'}
				<div class="text-success absolute top-1/2 right-3 -translate-y-1/2">
					<CheckCircle class="size-5" />
				</div>
			{:else if slugStatus === 'taken'}
				<div class="text-error absolute top-1/2 right-3 -translate-y-1/2">
					<CloseCircle class="size-5" />
				</div>
			{/if}
		</div>

		<div class="tooltip" data-tip={generateTooltip}>
			<button
				type="button"
				class="btn btn-square btn-soft"
				onclick={handleCheck}
				disabled={disabled || checking}
			>
				{#if checking}
					<span class="loading loading-spinner loading-sm"></span>
				{:else}
					<Refresh class="size-5" />
				{/if}
			</button>
		</div>
	</div>
	{#if slugStatus === 'taken'}
		<p class="text-error mt-1 text-xs">Este slug ya está en uso</p>
	{/if}
	<FormErrorMsg {error} />
</div>
