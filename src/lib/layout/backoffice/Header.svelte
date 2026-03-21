<script lang="ts">
	import * as m from '$paraglide/messages';
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

	const isResourcesActive = $derived(
		isActive(ROUTES.backoffice.categories.list) ||
			isActive(ROUTES.backoffice.tags.list) ||
			isActive(ROUTES.backoffice.attractions.list) ||
			isActive(ROUTES.backoffice.locations.list) ||
			isActive(ROUTES.backoffice.pickupPoints.list)
	);

	const isManagementActive = $derived(
		isActive(ROUTES.backoffice.users.list) ||
			isActive(ROUTES.backoffice.suppliers.list) ||
			isActive(ROUTES.backoffice.bookings.list)
	);

	let openDropdown = $state<string | null>(null);

	function toggleDropdown(name: string) {
		openDropdown = openDropdown === name ? null : name;
	}

	function closeDropdowns() {
		openDropdown = null;
	}

	/** Close dropdown when navigating */
	let currentPathname = $derived(page.url.pathname);
	$effect(() => {
		void currentPathname;
		openDropdown = null;
	});
</script>

<svelte:window onclick={closeDropdowns} />

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
						{m.activities_navLabel()}
					</a>
				</li>
				<li>
					<details>
						<summary class:menu-active={isResourcesActive}>Recursos</summary>
						<ul>
							<li>
								<a
									href={ROUTES.backoffice.categories.list}
									class:menu-active={isActive(ROUTES.backoffice.categories.list)}
								>
									{m.categories_navLabel()}
								</a>
							</li>
							<li>
								<a
									href={ROUTES.backoffice.tags.list}
									class:menu-active={isActive(ROUTES.backoffice.tags.list)}
								>
									{m.tags_navLabel()}
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
									href={ROUTES.backoffice.locations.list}
									class:menu-active={isActive(ROUTES.backoffice.locations.list)}
								>
									Ubicaciones
								</a>
							</li>
							<li>
								<a
									href={ROUTES.backoffice.pickupPoints.list}
									class:menu-active={isActive(ROUTES.backoffice.pickupPoints.list)}
								>
									{m.pickupPoints_navLabel()}
								</a>
							</li>
						</ul>
					</details>
				</li>
				<li>
					<details>
						<summary class:menu-active={isManagementActive}>Gestión</summary>
						<ul>
							<li>
								<a
									href={ROUTES.backoffice.users.list}
									class:menu-active={isActive(ROUTES.backoffice.users.list)}
								>
									Usuarios
								</a>
							</li>
							<li>
								<a
									href={ROUTES.backoffice.suppliers.list}
									class:menu-active={isActive(ROUTES.backoffice.suppliers.list)}
								>
									{m.suppliers_navLabel()}
								</a>
							</li>
							<li>
								<a
									href={ROUTES.backoffice.bookings.list}
									class:menu-active={isActive(ROUTES.backoffice.bookings.list)}
								>
									{m.bookings_navLabel()}
								</a>
							</li>
						</ul>
					</details>
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
					{m.activities_navLabel()}
				</a>
			</li>
			<li class="relative">
				<button
					type="button"
					class:menu-active={isResourcesActive}
					onclick={(e) => {
						e.stopPropagation();
						toggleDropdown('resources');
					}}
				>
					Recursos
					<svg
						class="inline size-3 transition-transform"
						class:rotate-180={openDropdown === 'resources'}
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
				{#if openDropdown === 'resources'}
					<ul
						class="menu bg-base-100 rounded-box absolute top-full left-0 z-50 mt-1 min-w-48 p-2 shadow-lg"
					>
						<li>
							<a
								href={ROUTES.backoffice.categories.list}
								class:menu-active={isActive(ROUTES.backoffice.categories.list)}
							>
								{m.categories_navLabel()}
							</a>
						</li>
						<li>
							<a
								href={ROUTES.backoffice.tags.list}
								class:menu-active={isActive(ROUTES.backoffice.tags.list)}
							>
								{m.tags_navLabel()}
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
								href={ROUTES.backoffice.locations.list}
								class:menu-active={isActive(ROUTES.backoffice.locations.list)}
							>
								Ubicaciones
							</a>
						</li>
						<li>
							<a
								href={ROUTES.backoffice.pickupPoints.list}
								class:menu-active={isActive(ROUTES.backoffice.pickupPoints.list)}
							>
								{m.pickupPoints_navLabel()}
							</a>
						</li>
					</ul>
				{/if}
			</li>
			<li class="relative">
				<button
					type="button"
					class:menu-active={isManagementActive}
					onclick={(e) => {
						e.stopPropagation();
						toggleDropdown('management');
					}}
				>
					Gestión
					<svg
						class="inline size-3 transition-transform"
						class:rotate-180={openDropdown === 'management'}
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
				{#if openDropdown === 'management'}
					<ul
						class="menu bg-base-100 rounded-box absolute top-full left-0 z-50 mt-1 min-w-48 p-2 shadow-lg"
					>
						<li>
							<a
								href={ROUTES.backoffice.users.list}
								class:menu-active={isActive(ROUTES.backoffice.users.list)}
							>
								Usuarios
							</a>
						</li>
						<li>
							<a
								href={ROUTES.backoffice.suppliers.list}
								class:menu-active={isActive(ROUTES.backoffice.suppliers.list)}
							>
								{m.suppliers_navLabel()}
							</a>
						</li>
						<li>
							<a
								href={ROUTES.backoffice.bookings.list}
								class:menu-active={isActive(ROUTES.backoffice.bookings.list)}
							>
								{m.bookings_navLabel()}
							</a>
						</li>
					</ul>
				{/if}
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
		<ThemeSwitcher />
		<a href={ROUTES.backoffice.login} class="btn btn-sm ml-2">Login</a>
	</div>
</header>
