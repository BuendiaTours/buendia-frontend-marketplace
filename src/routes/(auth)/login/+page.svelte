<script lang="ts">
	import { Mail, Lock } from 'svelte-iconoir';
</script>

<div class="flex min-h-screen items-center justify-center">
	<fieldset class="fieldset w-full max-w-md rounded-box border border-base-300 bg-base-200 p-8">
		<legend class="fieldset-legend px-4 text-xl font-semibold">Iniciar sesión</legend>

		<form method="POST" class="space-y-4">
			<!-- Email field -->
			<div>
				<label class="label">
					<span class="label-text">Email</span>
				</label>
				<label class="validator input flex w-full items-center gap-2">
					<Mail class="h-[1em] opacity-50" />
					<input type="email" name="email" placeholder="mail@site.com" class="grow" required />
				</label>
				<div class="validator-hint hidden text-sm text-error">
					Introduce una dirección de email válida
				</div>
			</div>

			<!-- Password field -->
			<div>
				<label class="label">
					<span class="label-text">Contraseña</span>
				</label>
				<label class="validator input flex w-full items-center gap-2">
					<Lock class="h-[1em] opacity-50" />
					<input
						type="password"
						name="password"
						placeholder="Contraseña"
						class="grow"
						required
						minlength="8"
						pattern={'(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'}
						title="Debe tener más de 8 caracteres, incluyendo número, letra minúscula y mayúscula"
					/>
				</label>
				<p class="validator-hint hidden text-sm text-error">
					Debe tener más de 8 caracteres, incluyendo:
					<br />Al menos un número
					<br />Al menos una letra minúscula
					<br />Al menos una letra mayúscula
				</p>
			</div>

			<!-- Actions -->
			<div class="flex flex-col gap-4 pt-4">
				<button type="submit" class="btn w-full btn-primary">Iniciar sesión</button>

				<a href="/forgot-password" class="link text-center text-sm link-hover">
					¿Olvidaste tu contraseña?
				</a>
			</div>
		</form>
	</fieldset>
</div>
