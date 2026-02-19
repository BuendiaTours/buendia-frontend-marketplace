<!--
PureHtmlDialog - Componente basado en el elemento HTML <dialog> nativo

PROPÓSITO:
Componente que utiliza el elemento <dialog> estándar de HTML5 con estilos
de Tailwind CSS y DaisyUI, proporcionando una API simple y moderna.

CARACTERÍSTICAS:
- Usa el elemento <dialog> nativo del navegador
- Soporte para modal y no-modal
- Backdrop personalizable con ::backdrop
- Cierre con ESC y click fuera del diálogo (configurable)
- Estilos de Tailwind y DaisyUI
- Snippet para contenido flexible
- Métodos show(), showModal() y close()

VENTAJAS DEL <dialog> NATIVO:
- Accesibilidad integrada (focus trap, ARIA)
- Backdrop nativo sin JavaScript adicional
- Gestión automática del z-index
- Soporte para formularios con method="dialog"
- API estándar del navegador

USO BÁSICO:
```svelte
<script lang="ts">
  let dialog;
</script>

<PureHtmlDialog bind:this={dialog} title="Mi diálogo">
  {#snippet content()}
    <p>Contenido del diálogo</p>
  {/snippet}
  {#snippet actions()}
    <button class="btn" onclick={() => dialog.close()}>Cerrar</button>
  {/snippet}
</PureHtmlDialog>

<button onclick={() => dialog.showModal()}>Abrir diálogo</button>
```

USO CON FORMULARIO:
```svelte
<PureHtmlDialog title="Formulario">
  {#snippet content()}
    <form method="dialog">
      <input type="text" name="name" />
      <button type="submit">Enviar</button>
    </form>
  {/snippet}
</PureHtmlDialog>
```
-->

<script lang="ts">
	import { CloseSquare } from '@solar-icons/svelte/Outline';
	import type { PureHtmlDialogConfig } from './PureHtmlDialog';
	import type { Snippet } from 'svelte';

	type Props = {
		title?: string;
		config?: PureHtmlDialogConfig;
		content?: Snippet;
		actions?: Snippet;
	};

	let { title = '', config = {}, content, actions }: Props = $props();

	const defaultConfig: PureHtmlDialogConfig = {
		modal: true,
		closeOnBackdrop: true,
		closeOnEscape: true
	};

	const mergedConfig = $derived({ ...defaultConfig, ...config });

	let dialogElement: HTMLDialogElement;

	// Métodos públicos para controlar el diálogo
	export function show() {
		dialogElement?.show();
	}

	export function showModal() {
		dialogElement?.showModal();
	}

	export function close(returnValue?: string) {
		dialogElement?.close(returnValue);
	}

	// Manejar click en el backdrop para cerrar
	function handleBackdropClick(event: MouseEvent) {
		if (!mergedConfig.closeOnBackdrop) return;

		const rect = dialogElement.getBoundingClientRect();
		const isInDialog =
			rect.top <= event.clientY &&
			event.clientY <= rect.top + rect.height &&
			rect.left <= event.clientX &&
			event.clientX <= rect.left + rect.width;

		if (!isInDialog) {
			close();
		}
	}

	// Manejar tecla ESC
	function handleKeydown(event: KeyboardEvent) {
		if (!mergedConfig.closeOnEscape) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		}
	}
</script>

<dialog
	bind:this={dialogElement}
	class="bg-base-100 rounded-lg p-0 shadow-xl backdrop:bg-(--default-overlay-bg)"
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
>
	<!-- Header con título y botón de cerrar -->
	{#if title}
		<div class="border-base-content/10 border-b px-6 py-4">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold">{title}</h3>
				<button
					type="button"
					class="btn btn-circle btn-ghost btn-sm"
					onclick={() => close()}
					aria-label="Cerrar"
				>
					<CloseSquare class="size-4" />
				</button>
			</div>
		</div>
	{/if}

	<!-- Contenido -->
	{#if content}
		<div class="px-6 py-4">
			{@render content()}
		</div>
	{/if}

	<!-- Acciones (footer) -->
	{#if actions}
		<div class="border-base-content/10 border-t px-6 py-4">
			<div class="flex justify-end gap-2">
				{@render actions()}
			</div>
		</div>
	{/if}
</dialog>

<style>
	/* Animación de entrada */
	dialog[open] {
		animation: dialog-show 0.25s ease-out;
	}

	/* Animación del backdrop */
	dialog[open]::backdrop {
		animation: backdrop-show 0.25s ease-out;
	}

	@keyframes dialog-show {
		from {
			opacity: 0;
			transform: translate(-50%, calc(-50% - 10px));
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%);
		}
	}

	@keyframes backdrop-show {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* Estilos base del diálogo */
	dialog {
		max-width: min(90vw, 600px);
		max-height: 90vh;
		overflow: auto;
		/* Centrar el diálogo */
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		margin: 0;
	}

	/* Scroll personalizado */
	dialog::-webkit-scrollbar {
		width: 8px;
	}

	dialog::-webkit-scrollbar-track {
		background: transparent;
	}

	dialog::-webkit-scrollbar-thumb {
		background: color-mix(in srgb, var(--color-base-content) 20%, transparent);
		border-radius: 4px;
	}

	dialog::-webkit-scrollbar-thumb:hover {
		background: color-mix(in srgb, var(--color-base-content) 30%, transparent);
	}
</style>
