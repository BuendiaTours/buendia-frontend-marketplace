<script lang="ts">
	import { CheckCircle } from '$lib/icons/Linear';

	type Props = {
		inARow?: boolean;
		wrapperClass?: string;
	};

	let { inARow, wrapperClass }: Props = $props();
</script>

<div
	class="
  flex flex-col
  {inARow ? '' : 'gap-4 rounded-xl border border-solid border-neutral-300 px-6 pt-4 pb-6'}
  {wrapperClass}
"
>
	<div class="flex justify-between text-neutral-800">
		<div class="flex gap-2">
			<p class="text-price">Total</p>
			<p class="p-lg font-bold">(2 planes)</p>
		</div>
		<div class="text-price">118,00 €</div>
	</div>
	<div class="p-base text-neutral-600 {inARow ? 'mt-2 mb-2 sm:mt-0 sm:text-right' : ''}">
		Todas las tasas e impuestos incluidos
	</div>
	<div
		class="flex flex-col {inARow
			? 'gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6'
			: ''} gap-6"
	>
		<div class={inARow ? 'sm:order-last' : ''}>
			<button type="button" class="e-button w-full"> Tramitar pedido </button>
		</div>
		<div class="flex flex-col gap-3 {inARow ? 'sm:order-first' : ''}">
			<div class="flex gap-2">
				<CheckCircle class="text-success-700 h-6 shrink-0 grow-0 basis-6 " />
				Pago seguro
			</div>
			<div class="flex gap-2">
				<CheckCircle class="text-success-700 h-6 shrink-0 grow-0 basis-6" />
				Sin costes ocultos
			</div>
			<div class="flex gap-2">
				<CheckCircle class="text-success-700 h-6 shrink-0 grow-0 basis-6" />
				Cancela gratis y paga en el free tour lo que creas justo
			</div>
		</div>
	</div>
</div>
