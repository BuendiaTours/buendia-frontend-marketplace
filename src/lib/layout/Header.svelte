<script lang="ts">
	import { page } from '$app/state';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

	type Props = {
		title?: string;
	};

	let { title = 'Mi Aplicación' }: Props = $props();

	const isActive = (path: string) => {
		// Para la raíz, comparación exacta
		if (path === '/') {
			return page.url.pathname === '/';
		}
		// Para otras rutas, verificar si comienza con el path
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
				<li><a href="/" class:menu-active={isActive('/')}>Inicio</a></li>
				<li><a href="/activities" class:menu-active={isActive('/activities')}>Actividades</a></li>
				<li><a href="/destinations" class:menu-active={isActive('/destinations')}>Destinos</a></li>
				<li><a href="/attractions" class:menu-active={isActive('/attractions')}>Atracciones</a></li>
				<li><a href="/components" class:menu-active={isActive('/components')}>Componentes</a></li>
			</ul>
		</div>
		<a href="/" class="p-2">
			<img id="bnd-header-logo" class="w-32" src="/buendia-logo.svg" alt={title} />
		</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="/" class:menu-active={isActive('/')}>Inicio</a></li>
			<li><a href="/activities" class:menu-active={isActive('/activities')}>Actividades</a></li>
			<li><a href="/destinations" class:menu-active={isActive('/destinations')}>Destinos</a></li>
			<li><a href="/attractions" class:menu-active={isActive('/attractions')}>Atracciones</a></li>
			<li><a href="/components" class:menu-active={isActive('/components')}>Componentes</a></li>
		</ul>
	</div>
	<div class="navbar-end">
		<!-- ✨ Theme Switcher -->
		<ThemeSwitcher />

		<a href="/login" class="btn btn-sm ml-2">Login</a>
	</div>
</header>
