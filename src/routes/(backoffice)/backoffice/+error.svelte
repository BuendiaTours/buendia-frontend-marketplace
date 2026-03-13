<script lang="ts">
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import ErrorDisplay from '$lib/components/backoffice/ErrorDisplay.svelte';
	import { ROUTES } from '$lib/config/routes';

	const isApiError = $derived(page.status === 500 || page.status === 502 || page.status === 503);

	const errorTitle = $derived(
		isApiError ? m.common_errorServiceUnavailable() : `Error ${page.status}`
	);

	const errorMessage = $derived.by(() => {
		if (isApiError) return m.common_errorServiceUnavailable();
		switch (page.status) {
			case 404:
				return m.common_errorNotFound();
			default:
				return page.error?.message || m.common_errorUnexpected();
		}
	});

	const technicalDetails = $derived({
		status: page.status,
		message: page.error?.message,
		url: page.url.pathname
	});
</script>

<ErrorDisplay title={errorTitle} message={errorMessage} {technicalDetails}>
	{#snippet actions()}
		<a href={ROUTES.backoffice.home} class="btn btn-primary">{m.common_errorBackToHome()}</a>
		<button class="btn btn-outline" onclick={() => window.location.reload()}>
			{m.common_errorRetry()}
		</button>
	{/snippet}
</ErrorDisplay>
