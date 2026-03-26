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

	let email = $state('');
	let loading = $state(false);
	let status = $state<'idle' | 'success' | 'error'>('idle');

	const successTitle = '¡Muchas gracias por suscribirte!';
	const successSubTitle = 'Pronto recibirás noticias nuestras en tu buzón';
	const errorTitle = 'Ha habido un problema';
	const errorSubTitle =
		'Lo sentimos, no ha sido posible añadirte a la newsletter, vuelve a intentarlo en unos minutos';

	const displayTitle = $derived(
		status === 'success' ? successTitle : status === 'error' ? errorTitle : title
	);
	const displaySubTitle = $derived(
		status === 'success' ? successSubTitle : status === 'error' ? errorSubTitle : subTitle
	);

	async function handleSubscribe() {
		if (!email || loading) return;
		loading = true;
		try {
			const res = await fetch('/api/newsletter/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});
			if (!res.ok) throw new Error();
			status = 'success';
		} catch {
			status = 'error';
		} finally {
			loading = false;
		}
	}
</script>

<div
	class="c-newsletter-registration bg-overlay relative min-h-[280px] overflow-hidden rounded-xl {wrapperClass}"
>
	<img
		src={imgUrl}
		alt="Suscríbete a nuestra newsletter"
		class="absolute inset-0 h-full w-full object-cover object-center opacity-28"
	/>
	<div class="relative flex gap-8 px-8 py-6 md:px-16 md:py-8">
		<div class="c-newsletter-registration__content flex w-full flex-col justify-center md:w-1/2">
			{#if displayTitle}
				<p class="h2-editorial whitespace-pre-line text-white">{displayTitle}</p>
			{/if}
			{#if displaySubTitle}
				<p class="p-base mt-2 text-white">{displaySubTitle}</p>
			{/if}
			{#if status !== 'success'}
				<div
					class="c-newsletter-registration__form mt-8 flex w-full max-w-max max-w-none flex-col items-center gap-2 rounded-xl bg-none p-0 md:max-w-[466px] md:flex-row md:bg-white md:p-2"
				>
					<input
						class="h-[48px] w-full appearance-none rounded-lg border-0 bg-white shadow-none ring-0 outline-none"
						type="email"
						name="newsletter-email"
						id="newsletter-email"
						placeholder="Introduce tu email"
						bind:value={email}
						disabled={loading}
					/>
					<button
						type="button"
						class="e-button e-button-lg w-full md:w-auto"
						disabled={loading}
						onclick={handleSubscribe}
					>
						Suscribirse
					</button>
				</div>
			{/if}
		</div>
		<div class="hidden w-1/2 items-center justify-center md:flex">
			<BuendiaLogoStar class="mr-0 h-[124px] w-[124px] text-white lg:-mr-46" />
		</div>
	</div>
</div>
