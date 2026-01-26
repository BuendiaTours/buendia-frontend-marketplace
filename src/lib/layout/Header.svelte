<script lang="ts">
	import { page } from '$app/stores';

	type Props = {
		title?: string;
	};

	let { title = 'Mi Aplicación' }: Props = $props();

	const isActive = (path: string) => $page.url.pathname === path;
</script>

<header class="navbar bg-base-100 shadow-sm">
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
			<ul class="dropdown-content menu z-[1] mt-3 w-52 menu-sm rounded-box bg-base-100 p-2 shadow">
				<li><a href="/" class:menu-active={isActive('/')}>Inicio</a></li>
				<li><a href="/activities" class:menu-active={isActive('/activities')}>Actividades</a></li>
				<li><a href="/destinations" class:menu-active={isActive('/destinations')}>Destinos</a></li>
				<li><a href="/components" class:menu-active={isActive('/components')}>Componentes</a></li>
			</ul>
		</div>
		<a href="/" class="btn text-xl btn-ghost">{title}</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="/" class:menu-active={isActive('/')}>Inicio</a></li>
			<li><a href="/activities" class:menu-active={isActive('/activities')}>Actividades</a></li>
			<li><a href="/destinations" class:menu-active={isActive('/destinations')}>Destinos</a></li>
			<li><a href="/components" class:menu-active={isActive('/components')}>Componentes</a></li>
		</ul>
	</div>
	<div class="navbar-end">
		<a href="/login" class="btn btn-sm">Login</a>
	</div>
</header>
