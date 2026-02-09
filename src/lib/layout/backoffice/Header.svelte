<script lang="ts">
	import { page } from '$app/state';
	import ThemeSwitcher from '$lib/components/backoffice/ThemeSwitcher.svelte';
	import { ROUTES } from '$lib/config/routes';

	type Props = {
		title?: string;
	};

	let { title = 'Mi Aplicación' }: Props = $props();

	const isActive = (path: string) => {
		return page.url.pathname.startsWith(path);
	};
</script>

<header class="navbar border-base-content/10 bg-base-100 border-b">
	<div class="navbar-start">
		<div class="dropdown">
			<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h8m-8 6h16"
					/>
				</svg>
			</div>
			<ul class="dropdown-content menu">
				<li>
					<a
						href={ROUTES.backoffice.activities.list}
						class:menu-active={isActive(ROUTES.backoffice.activities.list)}
					>
						Actividades
					</a>
				</li>
				<li>
					<a
						href={ROUTES.backoffice.destinations.list}
						class:menu-active={isActive(ROUTES.backoffice.destinations.list)}
					>
						Destinos
					</a>
				</li>
				<li>
					<a
						href={ROUTES.backoffice.attractions.list}
						class:menu-active={isActive(ROUTES.backoffice.attractions.list)}
					>
						Atracciones
					</a>
				</li>
				<li>
					<a
						href={ROUTES.backoffice.components}
						class:menu-active={isActive(ROUTES.backoffice.components)}
					>
						Componentes
					</a>
				</li>
			</ul>
		</div>
		<a href={ROUTES.backoffice.home} class="p-2">
			<img id="bnd-header-logo" class="w-32" src="/backoffice/buendia-logo.svg" alt={title} />
		</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li>
				<a
					href={ROUTES.backoffice.activities.list}
					class:menu-active={isActive(ROUTES.backoffice.activities.list)}
				>
					Actividades
				</a>
			</li>
			<li>
				<a
					href={ROUTES.backoffice.destinations.list}
					class:menu-active={isActive(ROUTES.backoffice.destinations.list)}
				>
					Destinos
				</a>
			</li>
			<li>
				<a
					href={ROUTES.backoffice.attractions.list}
					class:menu-active={isActive(ROUTES.backoffice.attractions.list)}
				>
					Atracciones
				</a>
			</li>
			<li>
				<a
					href={ROUTES.backoffice.components}
					class:menu-active={isActive(ROUTES.backoffice.components)}
				>
					Componentes
				</a>
			</li>
		</ul>
	</div>
	<div class="navbar-end">
		<!-- ✨ Theme Switcher -->
		<ThemeSwitcher />

		<a href={ROUTES.backoffice.login} class="btn btn-sm ml-2">Login</a>
	</div>
</header>
