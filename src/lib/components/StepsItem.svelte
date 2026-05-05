<script lang="ts">
	import { Unread } from '$lib/icons/Linear';

	type Props = {
		active?: boolean;
		done?: boolean;
		disabled?: boolean;
		step: number;
		text: string;
		slug?: string;
	};

	let { active, done, disabled, step, text, slug }: Props = $props();
</script>

<svelte:element
	this={slug && !disabled ? 'a' : 'div'}
	href={slug && !disabled ? slug : undefined}
	class="p-base flex items-center gap-2 {active || done
		? 'font-bold text-neutral-800'
		: 'text-neutral-500'} {disabled ? 'cursor-not-allowed opacity-40' : ''}"
>
	<span
		class="h4-editorial border-sloid flex h-8 shrink-0 grow-0 basis-8 {done
			? 'items-center'
			: ''} justify-center rounded-full border-2 !leading-[120%] font-bold {active
			? 'border-violet-500 bg-violet-500 text-white'
			: 'text-neutral-500'}"
	>
		{#if done}
			<Unread class="h-6 w-6" />
		{:else}
			{step}
		{/if}
	</span>
	{text}
</svelte:element>
