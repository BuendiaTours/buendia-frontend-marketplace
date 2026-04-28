<script lang="ts">
	import TrustpilotRating from '$lib/components/marketplace/TrustpilotRating.svelte';
	import SearchBar from '$lib/components/marketplace/SearchBar.svelte';

	type Props = {
		trustpilot?: { score: number; stars: number; total: number } | null;
	};

	let { trustpilot }: Props = $props();

	let searchRef: HTMLDivElement = $state() as HTMLDivElement;
	let isSticky = $state(false);

	$effect(() => {
		const observer = new IntersectionObserver(([entry]) => {
			isSticky = !entry.isIntersecting;
		});
		observer.observe(searchRef);
		return () => observer.disconnect();
	});
</script>

{#if isSticky}
	<div
		class="fixed top-0 right-0 left-0 z-50 border-b border-neutral-200 bg-white px-4 py-3 lg:hidden"
	>
		<SearchBar />
	</div>
{/if}

<div
	class="mx-auto flex aspect-[358/504] max-w-[1512px] items-center justify-center bg-cover bg-center px-4 lg:aspect-[3/1]"
	style="background-image: url(marketplace/home_header.png)"
>
	<div>
		<h2 class="h1-editorial mb-3 text-white lg:text-center">Tu viaje merece un buendía</h2>
		<h1 class="h2 text-white lg:text-center">
			Experiencias seleccionadas en español por todo el mundo
		</h1>
		<SearchBar bind:ref={searchRef} wrapperClass="max-w-[596px] mx-auto my-7 lg:my-8" />
		{#if trustpilot}
			<div class="flex lg:justify-center">
				<TrustpilotRating score={trustpilot.score} stars={trustpilot.stars} full={true} />
			</div>
		{/if}
	</div>
</div>
