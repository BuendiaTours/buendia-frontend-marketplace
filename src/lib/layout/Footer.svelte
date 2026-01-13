<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer class="footer-center footer bg-base-200 p-10 text-base-content">
	<aside>
		<p class="font-bold">
			Tu Empresa
			<br />
			Proporcionando experiencias increíbles desde 2020
		</p>
		<p>Copyright {currentYear} - Todos los derechos reservados</p>
	</aside>
	<nav>
		<div class="grid grid-flow-col gap-4">
			<a href="/about" class="link link-hover">Acerca de</a>
			<a href="/contact" class="link link-hover">Contacto</a>
			<a href="/privacy" class="link link-hover">Privacidad</a>
			<a href="/terms" class="link link-hover">Términos</a>
		</div>
	</nav>
</footer>
