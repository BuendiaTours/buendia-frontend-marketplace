<script lang="ts">
	import { Letter, Lock } from '@solar-icons/svelte/Outline';
</script>

<div class="flex min-h-screen items-center justify-center">
	<fieldset class="fieldset rounded-box border-base-300 bg-base-200 w-full max-w-md border p-8">
		<legend class="fieldset-legend px-4 text-xl font-semibold">Iniciar sesión</legend>

		<form method="POST" class="space-y-4">
			<!-- Email field -->
			<div>
				<label class="label">
					<span class="label-text">Email</span>
				</label>
				<label class="validator input flex w-full items-center gap-2">
					<Letter class="h-[1em] opacity-50" />
					<input type="email" name="email" placeholder="mail@site.com" class="grow" required />
				</label>
				<div class="validator-hint text-error hidden text-sm">
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
				<p class="validator-hint text-error hidden text-sm">
					Debe tener más de 8 caracteres, incluyendo:
					<br />Al menos un número
					<br />Al menos una letra minúscula
					<br />Al menos una letra mayúscula
				</p>
			</div>

			<!-- Actions -->
			<div class="flex flex-col gap-4 pt-4">
				<button type="submit" class="btn btn-primary w-full">Iniciar sesión</button>

				<a href="/forgot-password" class="link link-hover text-center text-sm">
					¿Olvidaste tu contraseña?
				</a>
			</div>
		</form>
	</fieldset>
</div>
