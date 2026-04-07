<script lang="ts">
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import { Letter, Lock } from '$lib/icons/Linear';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { form: formData } = data;

	const { form, errors, enhance, submitting, message } = superForm(formData);
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-6">
	<img src="/backoffice/wildcard_logo.png" alt="Wildcard" class="h-32" />
	<fieldset class="fieldset rounded-box border-base-300 bg-base-200 w-full max-w-md border p-8">
		<legend class="fieldset-legend px-4 text-xl font-semibold">{m.auth_loginTitle()}</legend>

		{#if $message}
			<div class="alert alert-error mb-4">
				<span>{$message}</span>
			</div>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<!-- Email field -->
			<div>
				<label class="label" for="email">
					<span class="label-text">{m.auth_emailLabel()}</span>
				</label>
				<label class="input flex w-full items-center gap-2">
					<Letter class="h-[1em] opacity-50" />
					<input
						id="email"
						type="email"
						name="email"
						placeholder="mail@site.com"
						class="grow"
						bind:value={$form.email}
						required
					/>
				</label>
				{#if $errors.email}
					<p class="text-error mt-1 text-sm">{$errors.email}</p>
				{/if}
			</div>

			<!-- Password field -->
			<div>
				<label class="label" for="password">
					<span class="label-text">{m.auth_passwordLabel()}</span>
				</label>
				<label class="input flex w-full items-center gap-2">
					<Lock class="h-[1em] opacity-50" />
					<input
						id="password"
						type="password"
						name="password"
						placeholder="********"
						class="grow"
						bind:value={$form.password}
						required
						minlength="8"
					/>
				</label>
				{#if $errors.password}
					<p class="text-error mt-1 text-sm">{$errors.password}</p>
				{/if}
			</div>

			<!-- Actions -->
			<div class="flex flex-col gap-4 pt-4">
				<button type="submit" class="btn btn-neutral w-full" disabled={$submitting}>
					{#if $submitting}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					{m.auth_loginButton()}
				</button>

				<a href="/forgot-password" class="link link-hover text-center text-sm">
					{m.auth_forgotPassword()}
				</a>
			</div>
		</form>
	</fieldset>
</div>
