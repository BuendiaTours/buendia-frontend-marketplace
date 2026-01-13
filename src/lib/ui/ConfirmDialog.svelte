<script lang="ts">
	import { confirmState, confirmClose } from '$lib/ui/confirm.svelte';

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') confirmClose(false);
	}
</script>

{#if confirmState.open}
	<div class="backdrop" on:click={() => confirmClose(false)}></div>

	<div
		class="dialog"
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-title"
		aria-describedby="confirm-desc"
		tabindex="-1"
		on:keydown={onKeydown}
	>
		<h2 id="confirm-title">{confirmState.title}</h2>
		<p id="confirm-desc">{confirmState.message}</p>

		<div class="actions">
			<button class="btn" type="button" on:click={() => confirmClose(false)}>
				{confirmState.cancelText}
			</button>

			<button
				class:danger={confirmState.danger}
				class="primary btn"
				type="button"
				on:click={() => confirmClose(true)}
			>
				{confirmState.confirmText}
			</button>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		z-index: 1000;
	}

	.dialog {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(520px, calc(100vw - 2rem));
		background: white;
		border-radius: 12px;
		padding: 1rem 1.25rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
		z-index: 1001;
	}
</style>
