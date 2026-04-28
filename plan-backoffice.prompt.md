## 📋 Plan: Eliminar Backoffice del Repositorio Marketplace

Aquí está el plan detallado y paso a paso. Este análisis profundo cubre 10 fases de eliminación con verificaciones específicas.

---

### TL;DR

Se van a eliminar **7 categorías** de archivos relacionados con backoffice de forma estructurada: rutas, componentes UI, server factories, assets estáticos, tipos API, dependencias npm, y referencias en config. El proceso es principalmente directo (eliminar carpetas), pero requiere cuidado especial con 2 recursos compartidos (`activities` y `multimedia` que usa marketplace).

---

### FASES DE ELIMINACIÓN

#### FASE 1: Análisis Previo (4 pasos de verificación)

1. **Verificar `src/lib/config/routes/core.ts`** — ¿se usa desde marketplace?
2. **Revisar `src/lib/types.ts`** — identificar tipos backoffice
3. **Revisar `src/lib/api/`** — confirmar no hay endpoints backoffice compartidos
4. **Revisar `.storybook/` y `vite.config.ts`** — configuración específica?

#### FASE 2: Eliminar Rutas & Componentes UI (3 pasos)

5. ✅ `src/routes/(backoffice)/` — **TODO** (auth, activities, attractions, destinations, users)
6. ✅ `src/lib/components/backoffice/` — **TODO** (18 componentes + SvelteImageCrop)
7. ✅ `src/lib/layout/backoffice/` — **TODO** (Footer, Header, etc)

#### FASE 3: Eliminar Server-Side & Actions (2 pasos)

8. ✅ `src/lib/server/backoffice/` — **TODO** (createAction, updateAction, deleteAction, flashMessages)
9. ✅ `src/lib/actions/backoffice/` — **TODO** (checkAll, confirmAction, photoswipeGallery)

#### FASE 4: Refactorizar Configuración de Rutas (4 pasos)

10. 🔧 `src/lib/config/routes/index.ts` — **LIMPIAR** (remover backofficeRoutes import)
11. ✅ `src/lib/config/routes/backoffice/` — **TODO** (6 archivos de rutas)
12. ✓ `src/lib/config/routes/core.ts` — **REVISAR** (si es solo backoffice → eliminar)
13. ✓ `src/lib/config/components.ts` — **REVISAR** (buscar referencias backoffice)

#### FASE 5: Eliminar Tipos & Requests de API (3 pasos)

14. ✅ `src/core/users/`, `attractions/`, `destinations/`, `categories/`, `tags/`, `distributives/` — **TODO TODO TODO** (SOLO backoffice)
15. ✓ Mantener `src/core/activities/` — **NO ELIMINAR** (lo usa marketplace PDP)
16. ✓ Mantener `src/core/multimedia/` — **NO ELIMINAR** (tipos compartidos)

#### FASE 6: Eliminar Assets Estáticos (1 paso)

17. ✅ `static/backoffice/` — **TODO** (logo, favicon, fonts Iosevka)

#### FASE 7: Limpiar `src/lib/types.ts` (1 paso)

18. 🔧 `src/lib/types.ts` — **LIMPIAR** (remover tipos específicos de backoffice)

#### FASE 8: Eliminar Dependencias npm (1 paso)

19. 📦 **ELIMINAR** del package.json:

- `bytemd`
- `@bytemd/plugin-gfm`
- `daisyui`
- `photoswipe`
- `theme-change`
- `@solar-icons/svelte` ⚠️ (verificar con grep — probablemente solo backoffice)

#### FASE 9: Búsqueda de Imports Rotos (2 pasos)

20. 🔍 **GREP MASIVO** — buscar referencias huérfanas:
    - `from '$lib/components/backoffice'`
    - `from '$lib/actions/backoffice'`
    - `from '$lib/server/backoffice'`
    - `from '$core/users'`, `attractions`, `destinations`, `categories`, `tags`, `distributives`
21. 🔧 Revisar archivos de config (svelte.config.js, tailwind.config.ts, etc)

#### FASE 10: Verificación Final (4 pasos)

22. ✅ `npm run check` — errores TypeScript
23. ✅ `npm run build` — compile de producción
24. ✅ `npm run lint` — código limpio
25. ✓ Pruebas manuales: `/backoffice` → 404, marketplace funciona, checkout funciona

---

### RESUMEN DE ARCHIVOS A ELIMINAR

| Directorio/Archivo                                                                           | Tipo              | Estado       |
| -------------------------------------------------------------------------------------------- | ----------------- | ------------ |
| `src/routes/(backoffice)/`                                                                   | Rutas SvelteKit   | ✅ Eliminar  |
| `src/lib/components/backoffice/`                                                             | Componentes UI    | ✅ Eliminar  |
| `src/lib/actions/backoffice/`                                                                | Server Actions    | ✅ Eliminar  |
| `src/lib/server/backoffice/`                                                                 | Server Factories  | ✅ Eliminar  |
| `src/lib/layout/backoffice/`                                                                 | Layout components | ✅ Eliminar  |
| `src/lib/config/routes/backoffice/`                                                          | Route config      | ✅ Eliminar  |
| `static/backoffice/`                                                                         | Assets            | ✅ Eliminar  |
| `src/core/users/`, `attractions/`, `destinations/`, `categories/`, `tags/`, `distributives/` | Types + API       | ✅ Eliminar  |
| `package.json`                                                                               | Dependencias      | ✅ Uninstall |

---

### ARCHIVOS A MANTENER CON CUIDADO ⚠️

| Archivo                             | Razón                        | Acción                              |
| ----------------------------------- | ---------------------------- | ----------------------------------- |
| `src/core/activities/`              | Marketplace PDP lo usa       | Mantener intacto                    |
| `src/core/multimedia/`              | Tipos compartidos en gallery | Mantener intacto                    |
| `src/lib/components/shared/Swiper*` | Marketplace carousels        | Mantener intacto                    |
| `src/lib/types.ts`                  | Tipos compartidos            | Limpiar solo referencias backoffice |
| `src/lib/config/routes/index.ts`    | Re-exporta rutas             | Remover `backofficeRoutes`          |

---

### Cambios en package.json

**Dependencias a eliminar:**

```json
{
	"dependencies": {
		"bytemd": "❌",
		"@bytemd/plugin-gfm": "❌",
		"daisyui": "❌",
		"photoswipe": "❌",
		"theme-change": "❌",
		"@solar-icons/svelte": "❌ (probablemente)"
	}
}
```

---

### Decisiones Clave

✅ **Mantener `src/core/activities/`** — Lo usa marketplace en PDP
✅ **Mantener `src/core/multimedia/`** — Tipos genéricos compartidos
✅ **Mantener `src/lib/components/shared/Swiper*`** — Lo usa marketplace
✅ **Eliminar 6 dependencias npm** — Solo backoffice, no marketplace
✅ **Preservar git history** — Un commit "Remove backoffice" documenta cambio

---

### Verificaciones Post-Eliminación

1. **Automated:** `npm run check && npm run build && npm run lint`
2. **Manual:**
   - Visitar `/backoffice` → 404 ✓
   - Marketplace homepage funciona ✓
   - Checkout flow funciona ✓
3. **Bundle:** Verificar ~2-3 MB de reducción

---

### Further Considerations

1. **Migraciones en repository backoffice**:
   - El repo separado de backoffice necesitará mantener:
     - `src/core/` completo
     - `src/lib/` con sus backoffice específicos
     - Versionar ambos repos en paralelo

2. **Git history**:
   - ¿Preservar commits de backoffice o hacer reset limpio?
   - Recomendación: Hacer un commit "Remove backoffice" documenta el cambio

3. **Documentación**:
   - Actualizar README.md si menciona backoffice
   - Actualizar CLAUDE.md si tiene referencias a backoffice
