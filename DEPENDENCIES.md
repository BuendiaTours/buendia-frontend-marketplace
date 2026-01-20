# Notas sobre Dependencias

## Zod - Versión fijada a 3.23.8

**Versión actual:** `3.23.8` (fijada, sin `^`)

**Motivo:** Incompatibilidad conocida entre Zod v4 y sveltekit-superforms.

### Problema

Zod v4 cambió su estructura interna de tipos:

- **v3:** `ZodObject<{...}, "strip", ZodTypeAny, {...}, {...}>`
- **v4:** `ZodObject<{...}, $strip>` (estructura simplificada)

Este cambio causa el error:

```
Error: No shape could be created for schema.
```

### Issues relacionados

- https://github.com/ciscoheat/sveltekit-superforms/issues/594
- https://github.com/ciscoheat/sveltekit-superforms/issues/649
- https://github.com/ciscoheat/sveltekit-superforms/issues/630

### Solución actual

Mantener Zod en v3.23.8 hasta que sveltekit-superforms lance soporte completo para Zod v4.

### Cuándo actualizar

Monitorear las releases de sveltekit-superforms para soporte oficial de Zod v4.
Cuando esté disponible, actualizar ambas dependencias:

```bash
npm install zod@^4 sveltekit-superforms@latest
```

---

**Última actualización:** 2026-01-20
