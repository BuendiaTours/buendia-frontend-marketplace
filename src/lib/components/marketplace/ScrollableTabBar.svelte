<script lang="ts">
	import { AltArrowLeft, AltArrowRight } from '$lib/icons/Linear';

	type Tab = {
		id: string;
		name: string;
		href: string;
	};

	type Props = {
		tabs: Tab[];
		activeId?: string | null;
		wrapperClass?: string;
	};

	let { tabs, activeId = null, wrapperClass = '' }: Props = $props();

	let scrollEl: HTMLElement;
	let showLeftArrow = $state(false);
	let showRightArrow = $state(false);

	function checkOverflow() {
		if (!scrollEl) return;
		showLeftArrow = scrollEl.scrollLeft > 1;
		showRightArrow =
			scrollEl.scrollWidth > scrollEl.clientWidth &&
			scrollEl.scrollLeft < scrollEl.scrollWidth - scrollEl.clientWidth - 1;
	}

	function scrollLeft() {
		scrollEl?.scrollBy({ left: -200, behavior: 'smooth' });
	}

	function scrollRight() {
		scrollEl?.scrollBy({ left: 200, behavior: 'smooth' });
	}

	$effect(() => {
		if (!scrollEl) return;
		checkOverflow();
		scrollEl.addEventListener('scroll', checkOverflow);
		const ro = new ResizeObserver(checkOverflow);
		ro.observe(scrollEl);
		return () => {
			scrollEl.removeEventListener('scroll', checkOverflow);
			ro.disconnect();
		};
	});
</script>

<div class="c-scrollable-tab-bar relative border-b border-neutral-200 {wrapperClass}">
	<nav bind:this={scrollEl} class="tab-bar flex gap-6 overflow-x-auto">
		{#each tabs as tab (tab.id)}
			<a
				href={tab.href}
				class="tab-bar__item p-lg rounded-full py-2 font-medium whitespace-nowrap text-neutral-700 transition-colors"
				class:tab-bar__item--active={tab.id === activeId}
			>
				{tab.name}
			</a>
		{/each}
	</nav>

	<!-- Left gradient + arrow -->
	<div
		class="pointer-events-none absolute inset-y-0 left-8 w-16 bg-gradient-to-r from-white to-transparent transition-opacity"
		class:opacity-0={!showLeftArrow}
	></div>
	<button
		type="button"
		onclick={scrollLeft}
		class="p-lg absolute inset-y-0 left-0 hidden items-center justify-center transition-opacity sm:flex"
		class:opacity-0={!showLeftArrow}
		class:pointer-events-none={!showLeftArrow}
		aria-label="Ver categorías anteriores"
	>
		<span
			class="cursor-pointer rounded-full border border-neutral-300 bg-white p-2.5 text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100"
		>
			<AltArrowLeft class="size-5" />
		</span>
	</button>

	<!-- Right gradient + arrow -->
	<div
		class="pointer-events-none absolute inset-y-0 right-8 w-16 bg-gradient-to-l from-white to-transparent transition-opacity"
		class:opacity-0={!showRightArrow}
	></div>
	<button
		type="button"
		onclick={scrollRight}
		class="absolute inset-y-0 right-0 hidden items-center justify-center transition-opacity sm:flex"
		class:opacity-0={!showRightArrow}
		class:pointer-events-none={!showRightArrow}
		aria-label="Ver más categorías"
	>
		<span
			class="cursor-pointer rounded-full border border-neutral-300 bg-white p-2.5 text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100"
		>
			<AltArrowRight class="size-5" />
		</span>
	</button>
</div>

<style>
</style>
