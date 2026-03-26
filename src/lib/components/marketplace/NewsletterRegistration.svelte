<script lang="ts">
	import { BuendiaLogoStar } from '$lib/icons/Linear';

	type Props = {
		title?: string;
		subTitle?: string;
		wrapperClass?: string;
		imgUrl?: string;
	};

	let {
		title = 'Lo mejor de buendía,\nen tu correo',
		subTitle = 'Suscríbete a nuestra newsletter y accede a nuestros destionos, experiencias exclusivas y ventajas solo para exploradores',
		imgUrl = '/marketplace/newsletter-bg.jpg',
		wrapperClass
	}: Props = $props();
</script>

<div
	class="c-newsletter-registration relative min-h-[280px] overflow-hidden rounded-xl {wrapperClass}"
>
	<img
		src={imgUrl}
		alt="Suscríbete a nuestra newsletter"
		class="absolute inset-0 h-full w-full object-cover object-center"
	/>
	<div class="bg-alpha-ink-72 relative flex gap-8 px-8 py-6 md:px-16 md:py-8">
		<div class="c-newsletter-registration__content flex w-full flex-col justify-center md:w-1/2">
			{#if title}
				<p class="h2-editorial whitespace-pre-line text-white">{title}</p>
			{/if}
			{#if subTitle}
				<p class="p-base mt-2 text-white">{subTitle}</p>
			{/if}
			<div
				class="c-newsletter-registration__form mt-8 flex w-full max-w-max max-w-none flex-col items-center gap-2 rounded-xl bg-none p-0 md:max-w-[466px] md:flex-row md:bg-white md:p-2"
			>
				<input
					class="w-full appearance-none rounded-lg border-0 bg-white py-0 shadow-none ring-0 outline-none md:py-3"
					type="email"
					name="newsletter-email"
					id="newsletter-email"
					placeholder="Introduce tu email"
				/>
				<button type="button" class="e-button e-button-lg w-full md:w-auto">Suscribirse</button>
			</div>
		</div>
		<div class="hidden w-1/2 items-center justify-center md:flex">
			<BuendiaLogoStar class="mr-0 h-[124px] w-[124px] text-white lg:-mr-46" />
		</div>
	</div>
</div>
