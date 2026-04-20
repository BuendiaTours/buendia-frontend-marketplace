<script lang="ts">
	type Props = {
		wrapperClass?: string;
	};

	let { wrapperClass }: Props = $props();
</script>

<div
	class="{wrapperClass} relative flex flex-col items-start gap-6 overflow-hidden rounded-xl bg-cover bg-center bg-no-repeat px-5 py-8 sm:gap-7 sm:py-12 lg:gap-8 lg:px-6 lg:py-16"
	style="background-image: url(https://dummyimage.com/770x408/000/fff.jpg);"
>
	<div class="pointer-events-none absolute inset-0 rounded-xl bg-neutral-900/[.48]"></div>
	<h1 class="h1-editorial relative text-white">¡Todo listo para Lisboa!</h1>
	<p class="p-base relative text-white">Reserva confirmada: BND-34059743</p>

	<button type="button" class="e-button e-button-secondary relative"> Añadir al calendario </button>
</div>
