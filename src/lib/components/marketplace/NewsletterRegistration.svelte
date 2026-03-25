<script lang="ts">
	import { BuendiaLogoStar } from '$lib/icons/Linear';

	type Props = {
		title?: string;
		subTitle?: string;
		wrapperClass?: string;
		imgUrl?: string;
	};

	let {
		title = 'Lo mejor de buendía, en tu correo',
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
	<div class="bg-alpha-ink-72 relative flex gap-16 px-16 py-8">
		<div class="c-newsletter-registration__content flex w-1/2 flex-col justify-center">
			{#if title}
				<p class="h2-editorial text-white">{title}</p>
			{/if}
			{#if subTitle}
				<p class="p-base mt-2 text-white">{subTitle}</p>
			{/if}
			<div class="mt-8 flex w-full max-w-[466px] items-center gap-2 rounded-xl bg-white p-2">
				<input
					class="appareance-none w-full rounded-full"
					type="email"
					name="newsletter-email"
					id="newsletter-email"
				/>
				<button type="button" class="e-button e-button-lg">Suscribirse</button>
			</div>
		</div>
		<div class="c-newsletter-registration__form w-1/2">
			<BuendiaLogoStar class="h-[140px] text-white" />
		</div>
	</div>
</div>
