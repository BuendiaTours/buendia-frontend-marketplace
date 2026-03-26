<script lang="ts">
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

<div class="relative {wrapperClass}">
	<nav bind:this={scrollEl} class="tab-bar flex gap-1 overflow-x-auto">
		{#each tabs as tab (tab.id)}
			<a
				href={tab.href}
				class="tab-bar__item p-sm rounded-full px-4 py-2 font-medium whitespace-nowrap transition-colors"
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
		class="absolute inset-y-0 left-0 hidden items-center justify-center px-1 transition-opacity sm:flex"
		class:opacity-0={!showLeftArrow}
		class:pointer-events-none={!showLeftArrow}
		aria-label="Ver categorías anteriores"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M15 18l-6-6 6-6" />
		</svg>
	</button>

	<!-- Right gradient + arrow -->
	<div
		class="pointer-events-none absolute inset-y-0 right-8 w-16 bg-gradient-to-l from-white to-transparent transition-opacity"
		class:opacity-0={!showRightArrow}
	></div>
	<button
		type="button"
		onclick={scrollRight}
		class="absolute inset-y-0 right-0 hidden items-center justify-center px-1 transition-opacity sm:flex"
		class:opacity-0={!showRightArrow}
		class:pointer-events-none={!showRightArrow}
		aria-label="Ver más categorías"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M9 18l6-6-6-6" />
		</svg>
	</button>
</div>

<style>
	.tab-bar {
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;

		&::-webkit-scrollbar {
			display: none;
		}
	}

	.tab-bar__item {
		color: var(--color-neutral-600, #525252);
		border-bottom: 2px solid transparent;
		border-radius: 0;
		padding-inline: 0;
		padding-block: 0.5rem;
		margin-inline-end: 1.5rem;

		&:hover {
			color: var(--color-neutral-900, #171717);
		}

		&--active {
			color: var(--color-neutral-900, #171717);
			font-weight: 600;
			border-bottom-color: currentColor;
		}
	}
</style>
