<script lang="ts">
	/**
	 * Component to showcase all custom icons
	 * This is a demo/test component to verify icons work correctly
	 */
	import { ExampleIcon } from './index';
</script>

<div class="icon-showcase">
	<h2>Custom Icons Showcase</h2>

	<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
		<!-- Default size -->
		<div class="icon-item">
			<ExampleIcon />
			<span class="text-sm">Default (1em)</span>
		</div>

		<!-- With Tailwind class -->
		<div class="icon-item">
			<ExampleIcon class="size-6 text-blue-500" />
			<span class="text-sm">size-6 + blue</span>
		</div>

		<!-- With numeric size -->
		<div class="icon-item">
			<ExampleIcon size={32} color="#10b981" />
			<span class="text-sm">32px + green</span>
		</div>

		<!-- Mirrored -->
		<div class="icon-item">
			<ExampleIcon class="size-8 text-red-500" mirrored={true} />
			<span class="text-sm">Mirrored</span>
		</div>

		<!-- Large -->
		<div class="icon-item">
			<ExampleIcon class="size-12 text-purple-500" />
			<span class="text-sm">Large (size-12)</span>
		</div>

		<!-- Extra large with custom color -->
		<div class="icon-item">
			<ExampleIcon size="4rem" color="#f59e0b" />
			<span class="text-sm">4rem + orange</span>
		</div>

		<!-- With accessibility -->
		<div class="icon-item">
			<ExampleIcon class="size-6" alt="Example icon for demo" />
			<span class="text-sm">With alt text</span>
		</div>

		<!-- Responsive size -->
		<div class="icon-item">
			<ExampleIcon class="size-6 text-gray-400 hover:text-gray-900 md:size-8" />
			<span class="text-sm">Responsive + hover</span>
		</div>
	</div>
</div>

<style>
	.icon-showcase {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	h2 {
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 2rem;
	}

	.icon-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.icon-item:hover {
		border-color: #3b82f6;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
	}

	.text-sm {
		font-size: 0.875rem;
		color: #6b7280;
	}
</style>
