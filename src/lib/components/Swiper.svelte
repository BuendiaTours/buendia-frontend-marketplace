<!--
Ejemplo de uso:

<SwiperElement
  className="w-full"
  options={{
    slidesPerView: 1,
    spaceBetween: 16,
    navigation: true,
    pagination: { clickable: true },
    scrollbar: { draggable: true },
    loop: true
  }}
>
  <swiper-slide>Slide 1</swiper-slide>
  <swiper-slide>Slide 2</swiper-slide>
  <swiper-slide>Slide 3</swiper-slide>
</SwiperElement>
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { registerSwiperElements } from '$lib/components/Swiper';

	export let options: Record<string, any> = {};
	export let className = '';

	let el: any;

	onMount(async () => {
		await registerSwiperElements();

		// Pasar opciones como propiedades al web component
		// (Swiper Element acepta props/params en el elemento)
		Object.assign(el, options);

		// Inicializa si no usas auto-init por atributos (más control así)
		el.initialize?.();
	});
</script>

<swiper-container bind:this={el} init="false" class={className}>
	<slot />
</swiper-container>
