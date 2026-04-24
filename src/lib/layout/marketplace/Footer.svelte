<script lang="ts">
	import TrustpilotRating from '$lib/components/marketplace/TrustpilotRating.svelte';

	type Props = {
		trustpilot: { score: number; total: number } | null;
	};

	let { trustpilot }: Props = $props();
</script>

<footer class="layout-footer-area bg-neutral-900 py-12 lg:py-24">
	<div class="wrapper">
		<div class="mb-7 lg:mb-13">
			<a href="/" rel="home" aria-label="Ir a la página principal">
				<img src="/marketplace/footer/logo_footer.svg" alt="" loading="lazy" />
			</a>
		</div>
	</div>
	<div class="wrapper divide-y divide-neutral-700">
		<div
			class="flex flex-col gap-4 gap-7 pb-7 text-neutral-300 sm:grid sm:grid-cols-3 lg:grid-cols-4 lg:pb-12"
		>
			<div class="flex flex-col justify-between gap-4">
				{#if trustpilot}
					<div class="flex flex-col gap-1">
						<TrustpilotRating score={trustpilot.score} />
						<p class="b-base">Empresa mejor valorada del sector</p>
					</div>
				{/if}
				<div class="flex flex-col gap-3">
					<a
						href="https://www.untourism.int/es/affiliate-member-organization/708015"
						target="_blank"
						rel="nofollow noopener noreferrer"
						aria-label="ONU Turismo"
					>
						<img src="/marketplace/footer/un_tourism_logo.svg" alt="ONU Turismo" loading="lazy" />
					</a>
					<p>Miembros de ONU Turismo</p>
				</div>
			</div>
			<div class="flex flex-col items-start gap-4">
				<a href="/aviso-legal" aria-label="Aviso legal"> Aviso legal </a>
				<a href="/terminos-condiciones" aria-label="Términos y condiciones">
					Términos y condiciones
				</a>
				<a href="/politica-privacidad" aria-label="Política de privacidad">
					Política de privacidad
				</a>
				<a href="/politica-cookies" aria-label="Política de cookies"> Política de cookies </a>
				<button
					type="button"
					class=""
					aria-label="Gestionar cookies"
					onclick={() =>
						(
							window as Window & { OneTrust?: { ToggleInfoDisplay: () => void } }
						).OneTrust?.ToggleInfoDisplay()}
				>
					Gestionar cookies
				</button>
			</div>
			<div class="flex flex-col items-start gap-4">
				<a href="/contacto" aria-label="Contacto"> Contacto </a>
				<a href="/blog" aria-label="Blog"> Blog </a>
				<a href="/" aria-label="Sobre nosotros"> Sobre nosotros </a>
				<a href="/es/guias" aria-label="Guías de viaje"> Guías de viaje </a>
			</div>
			<div class="flex flex-col justify-between gap-9">
				<div class="flex gap-4">
					<a
						href="https://www.facebook.com/buendia.travel"
						target="_blank"
						rel="nofollow noopener noreferrer"
						class="social__item-list"
						aria-label="Visitar nuestra página de Facebook"
					>
						<img src="/marketplace/social/facebook.svg" alt="facebook" loading="lazy" />
					</a>
					<a
						href="https://www.instagram.com/buendia.travel/"
						target="_blank"
						rel="nofollow noopener noreferrer"
						class="social__item-list"
						aria-label="Visitar nuestro perfil de Instagram"
					>
						<img src="/marketplace/social/instagram.svg" alt="instagram" loading="lazy" />
					</a>
					<a
						href="https://www.tiktok.com/@buendia"
						target="_blank"
						rel="nofollow noopener noreferrer"
						class="social__item-list"
						aria-label="Visitar nuestro perfil de TikTok"
					>
						<img src="/marketplace/social/tiktok.svg" alt="tiktok" loading="lazy" />
					</a>
					<a
						href="https://www.youtube.com/channel/UCzMaDtl8iiIYSegNlihdsvw"
						target="_blank"
						rel="nofollow noopener noreferrer"
						class="social__item-list"
						aria-label="Visitar nuestro canal de YouTube"
					>
						<img src="/marketplace/social/youtube.svg" alt="youtube" loading="lazy" />
					</a>
					<a
						href="https://www.linkedin.com/company/buendiatravel/"
						target="_blank"
						rel="nofollow noopener noreferrer"
						class="social__item-list"
						aria-label="Visitar nuestro perfil de LinkedIn"
					>
						<img src="/marketplace/social/linkedin.svg" alt="linkedin" loading="lazy" />
					</a>
				</div>
				<div class="flex flex-col gap-3">
					<p class="p-base">Métodos de pago</p>
					<div class="grid grid-cols-4 gap-2 sm:flex sm:flex-row">
						<img
							class="w-full sm:w-auto"
							src="/marketplace/pay/visa.svg"
							alt="Visa"
							loading="lazy"
						/>
						<img
							class="w-full sm:w-auto"
							src="/marketplace/pay/mastercard.svg"
							alt="Master Card"
							loading="lazy"
						/>
						<img
							class="w-full sm:w-auto"
							src="/marketplace/pay/amazon.svg"
							alt="Amazon Pay"
							loading="lazy"
						/>
						<img
							class="w-full sm:w-auto"
							src="/marketplace/pay/klarna.svg"
							alt="Klarna"
							loading="lazy"
						/>
					</div>
				</div>
			</div>
		</div>
		<div class="flex flex-col justify-between gap-6 pt-7 sm:flex-row sm:items-center lg:pt-12">
			<div class="p-base text-neutral-300">
				© 2011 - {new Date().getFullYear()} Buendía Travel.
			</div>
			<div class="grid grid-cols-3 items-center gap-2 sm:flex">
				<img
					loading="lazy"
					class="w-full sm:w-auto"
					alt="Financiado por la Unión Europea"
					src="/marketplace/footer/logo_financiado_ue.png"
				/>
				<img
					loading="lazy"
					class="w-full sm:w-auto"
					alt="Ministerio de Industria y Turismo"
					src="/marketplace/footer/logo_turismo.png"
				/>
				<img
					loading="lazy"
					class="w-full sm:w-auto"
					alt="Plan de Recuperación, Transformación y Resiliencia"
					src="/marketplace/footer/logo_plan.png"
				/>
			</div>
		</div>
	</div>
</footer>
