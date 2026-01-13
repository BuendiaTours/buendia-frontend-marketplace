# Acciones de Svelte (Actions)

Este directorio contiene acciones reutilizables de Svelte para funcionalidades comunes.

## `checkAll`

Acción para implementar check/uncheck all en tablas con checkboxes.

### Características

- ✅ Solo afecta checkboxes en la **misma columna** (mismo índice de `<td>`)
- ✅ Solo afecta checkboxes dentro de la **misma tabla**
- ✅ Funciona con **múltiples tablas** en la misma página
- ✅ Funciona con **múltiples columnas de checkboxes** en la misma tabla

### Uso

```svelte
<script lang="ts">
	import { checkAll } from '$lib/actions/checkAll';
</script>

<table>
	<thead>
		<tr>
			<!-- Aplica use:checkAll al checkbox del header -->
			<th><input type="checkbox" use:checkAll /></th>
			<th>Nombre</th>
			<th>Email</th>
		</tr>
	</thead>
	<tbody>
		{#each items as item}
			<tr>
				<td>
					<input type="checkbox" name="selected[]" value={item.id} />
				</td>
				<td>{item.name}</td>
				<td>{item.email}</td>
			</tr>
		{/each}
	</tbody>
</table>
```

### Ejemplo con múltiples columnas de checkboxes

```svelte
<table>
	<thead>
		<tr>
			<th><input type="checkbox" use:checkAll /></th>
			<!-- Columna 1 -->
			<th>Nombre</th>
			<th><input type="checkbox" use:checkAll /></th>
			<!-- Columna 2 -->
		</tr>
	</thead>
	<tbody>
		{#each items as item}
			<tr>
				<td><input type="checkbox" name="active[]" value={item.id} /></td>
				<td>{item.name}</td>
				<td><input type="checkbox" name="featured[]" value={item.id} /></td>
			</tr>
		{/each}
	</tbody>
</table>
```

Cada checkbox del header solo afectará a los checkboxes de su propia columna.

### Ejemplo con múltiples tablas

```svelte
<!-- Tabla 1 -->
<table>
	<thead>
		<tr>
			<th><input type="checkbox" use:checkAll /></th>
			<th>Usuarios</th>
		</tr>
	</thead>
	<tbody>
		<!-- ... -->
	</tbody>
</table>

<!-- Tabla 2 -->
<table>
	<thead>
		<tr>
			<th><input type="checkbox" use:checkAll /></th>
			<th>Productos</th>
		</tr>
	</thead>
	<tbody>
		<!-- ... -->
	</tbody>
</table>
```

Cada tabla funciona de forma independiente.
