<script lang="ts">
	import { ChatRoundLine } from '$lib/icons/Linear';
	import { browser } from '$app/environment';
	import { PUBLIC_HUBSPOT_ID } from '$env/static/public';

	type HubspotWindow = Window &
		typeof globalThis & {
			hsConversationsSettings?: { loadImmediately?: boolean };
			hsConversationsOnReady?: (() => void)[];
			HubSpotConversations?: { widget: { open: () => void; close: () => void } };
		};

	let chatAvailable = $state(false);

	$effect(() => {
		if (!browser) return;

		const win = window as HubspotWindow;

		win.hsConversationsSettings = { loadImmediately: true };

		win.hsConversationsOnReady = win.hsConversationsOnReady || [];
		win.hsConversationsOnReady.push(() => {
			chatAvailable = true;
		});

		const existing = document.getElementById('hs-script-loader');
		if (existing) return;

		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.id = 'hs-script-loader';
		script.async = true;
		script.defer = true;
		script.src = `//js-eu1.hs-scripts.com/${PUBLIC_HUBSPOT_ID}.js`;
		document.head.appendChild(script);
	});

	function openChat() {
		(window as HubspotWindow).HubSpotConversations?.widget.open();
	}
</script>

{#if chatAvailable}
	<div class="rounded-xl border border-solid border-neutral-300 bg-white p-5 lg:p-6">
		<p class="p mb-2 flex items-center gap-1 font-bold text-neutral-800 lg:gap-2">
			<ChatRoundLine class="size-6" />Hablamos contigo
		</p>
		<p class="p text-neutral-700 lg:pl-8">¿Dudas? Te ayudamos por chat o teléfono.</p>
		<div class="mt-5 flex flex-col gap-3 lg:mt-6 lg:flex-row lg:items-center lg:justify-between">
			<button class="e-button e-button-secondary" onclick={openChat}>Abrir chat</button>
			<a href="tel:+34984708484" class="e-button e-button-tertiary lg:!hidden"
				>Llamar al + 34 984 70 84 84</a
			>
			<span class="p hidden text-neutral-800 lg:block">Tel: + 34 984 70 84 84</span>
		</div>
	</div>
{/if}
