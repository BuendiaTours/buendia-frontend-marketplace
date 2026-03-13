<script lang="ts">
	/**
	 * Review comment - Tarjeta de comentario para marketplace
	 *
	 * @component
	 */

	type Reply = {
		author?: string;
		content: string;
	};

	let { reply }: { reply: Reply } = $props();
</script>

<article class="c-review-comment rounded-md bg-[var(--color-surface-subtle)] p-6">
	<div class="flex gap-2">
		<div class="c-review-comment__avatar w-6 shrink-0">
			<img
				src="/marketplace/buendia-logo-comment-icon.svg"
				alt="Avatar del autor de la respuesta"
				class="h-6 w-6 rounded-full object-cover"
			/>
		</div>
		<div>
			{#if reply.author}
				<p class="c-review-comment__author p-base font-bold">{reply.author}</p>
			{/if}
			<p class="review-comment__content p-base">{reply.content}</p>
		</div>
	</div>
</article>
