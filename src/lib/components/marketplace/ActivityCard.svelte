<script lang="ts">
	/**
	 * ActivityCard - Tarjeta de actividad para marketplace
	 *
	 * Muestra información resumida de una actividad con imagen,
	 * título, descripción, ubicación y precio.
	 *
	 * @component
	 */

	type Activity = {
		title: string;
		description: string;
		price: number;
		image?: string;
		location?: string;
	};

	let { activity }: { activity: Activity } = $props();
</script>

<article class="activity-card">
	{#if activity.image}
		<img src={activity.image} alt={activity.title} class="activity-card__image" />
	{:else}
		<div class="activity-card__image activity-card__image--placeholder">
			<span class="text-sm text-gray-400">Sin imagen</span>
		</div>
	{/if}

	<div class="activity-card__content">
		<h3 class="activity-card__title">{activity.title}</h3>

		{#if activity.location}
			<p class="activity-card__location">{activity.location}</p>
		{/if}

		<p class="activity-card__description">{activity.description}</p>

		<div class="activity-card__footer">
			<span class="activity-card__price">${activity.price}</span>
			<button class="activity-card__button">Reservar</button>
		</div>
	</div>
</article>

<style>
	.activity-card {
		background-color: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
	}

	.activity-card:hover {
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
		transform: translateY(-4px);
	}

	.activity-card__image {
		width: 100%;
		height: 200px;
		object-fit: cover;
	}

	.activity-card__image--placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f3f4f6;
	}

	.activity-card__content {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		flex: 1;
	}

	.activity-card__title {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
		color: #1f2937;
		line-height: 1.4;
	}

	.activity-card__location {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	}

	.activity-card__location::before {
		content: '📍 ';
	}

	.activity-card__description {
		font-size: 0.875rem;
		color: #4b5563;
		margin: 0;
		line-height: 1.6;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.activity-card__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 0.75rem;
		margin-top: auto;
		border-top: 1px solid #e5e7eb;
	}

	.activity-card__price {
		font-size: 1.5rem;
		font-weight: 700;
		color: #ff6b35;
	}

	.activity-card__button {
		background-color: #ff6b35;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.5rem 1.25rem;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.activity-card__button:hover {
		background-color: #e55a2b;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3);
	}
</style>
