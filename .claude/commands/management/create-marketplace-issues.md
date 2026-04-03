# Workflow: Crear Issues de Componentes Marketplace

## Descripcion

Recibe una especificacion de pagina o funcionalidad del **marketplace** (PLP, PDP, checkout, landing), la analiza desde la perspectiva de componentes visuales, y crea issues de GitHub orientados a que Claude pueda desarrollarlos. Cada issue describe un componente o grupo de componentes con su contexto visual, props, datos necesarios, y criterios de aceptacion tecnicos.

**Dominio**: Marketplace — paginas publicas (Tailwind CSS custom, SEO, responsive, data from API).
**No usar para**: CRUD de backoffice — usar `/management/create-backoffice-issues` en su lugar.

## Contexto del proyecto

Antes de analizar, lee estos archivos:

- `CLAUDE.md` — Convenciones, estructura, patrones
- `.claude/docs/github-setup.md` — Repo, proyecto, labels, issue types

### Estructura del marketplace

| Directorio                             | Que contiene                                                        |
| -------------------------------------- | ------------------------------------------------------------------- |
| `src/lib/components/marketplace/`      | Componentes reutilizables del marketplace                           |
| `src/routes/(marketplace)/`            | Paginas publicas (PLP, PDP)                                         |
| `src/routes/(marketplace)/components/` | Componentes especificos de pagina                                   |
| `src/routes/(marketplace-checkout)/`   | Flujo de checkout                                                   |
| `src/lib/styles/`                      | CSS global, variables, clases custom                                |
| `src/core/`                            | Domain layer (types, requests) — datos que consumen los componentes |

### Convenciones de componentes marketplace

- Svelte 5 runes (`$props()`, `$derived()`, snippets, `onclick`)
- Tailwind CSS (no DaisyUI — eso es backoffice)
- CSS scoped con `<style>` para logica visual compleja
- Responsive: mobile-first, breakpoints via Tailwind
- SEO: semantica HTML correcta (`<h1>`, `<article>`, `<nav>`, etc.)
- i18n: todas las strings via `$paraglide/messages`
- Datos: vienen de load functions, nunca fetch directo en componentes

## Input requerido

- Especificacion: `$ARGUMENTS`
- Formatos aceptados:
  - Descripcion de pagina o seccion: "pagina de listado de actividades con filtros, cards y paginacion"
  - Link a Figma o screenshots pegados en el chat
  - Epic de Jira: `PE-XXX`
  - Lista de componentes a crear
- Si `$ARGUMENTS` esta vacio, preguntar al usuario que describa lo que necesita.

## Pasos

### Paso 1: Entender el requisito visual

1. Obtener la especificacion (Figma, screenshots, descripcion).
2. Identificar:
   - **Pagina destino**: PLP, PDP, checkout, landing, otra.
   - **Componentes visibles**: listar cada bloque visual distinguible.
   - **Datos necesarios**: que datos del API consume cada componente.
   - **Interacciones**: clicks, hover, scroll, filtros, modales, sliders.

### Paso 2: Analisis de componentes

Para cada componente identificado, determinar:

1. **Existe ya?** Buscar en `src/lib/components/marketplace/` y en los issues del kanban.
2. **Es reutilizable o especifico de pagina?**
   - Reutilizable → `src/lib/components/marketplace/`
   - Especifico → `src/routes/(marketplace)/[page]/components/`
3. **Complejidad**:
   - **Simple** (size XS): componente sin estado, solo props y render.
   - **Medio** (size S): componente con estado local, interacciones basicas.
   - **Complejo** (size M+): slider, mapa, galeria, filtros con URL sync, overlay.
4. **Dependencias de datos**: que types de `src/core/` necesita, que load function lo alimenta.
5. **Dependencias de otros componentes**: si usa componentes hijos que tambien hay que crear.

**Output**: Mapa de componentes con clasificacion.

**Checkpoint**: Presentar el mapa al usuario. Esperar aprobacion.

### Paso 3: Discusion tecnica

Discutir decisiones con el usuario:

1. **Naming**: proponer nombres de componente siguiendo el patron existente (PascalCase.svelte).
2. **Composicion**: que componentes son hijos de cuales (arbol de componentes).
3. **Responsive**: breakpoints clave, si hay cambios de layout o solo de spacing.
4. **Props vs datos**: que recibe cada componente como prop vs que obtiene de la load function.
5. **Reutilizacion**: si un componente aparece en PLP y PDP, una sola implementacion reutilizable.
6. **CSS approach**: Tailwind puro vs scoped CSS para casos complejos (sliders, animaciones).
7. **Accesibilidad**: roles ARIA necesarios, keyboard navigation.

Para cada pregunta, proponer una respuesta razonada. El usuario confirma o ajusta.

**Checkpoint**: Decisiones aprobadas. Proceder a crear issues.

### Paso 4: Descomposicion en issues

**Criterio de granularidad:**

- **Un componente simple** = un issue (size XS-S).
- **Un componente complejo** = un issue (size M).
- **Componentes padre+hijos muy acoplados** = un solo issue que los crea juntos.
- **Pagina completa** = un issue para la route + composicion (wiring de componentes ya creados).
- **Grupo de 2-3 componentes simples relacionados** = se pueden agrupar en un issue si tiene sentido.

**Orden de creacion:**

1. Componentes hoja (sin dependencias de otros componentes nuevos)
2. Componentes padre (que usan los hijos)
3. Paginas/routes (que componen todo)

**Estructura de cada issue:**

```markdown
## Descripcion

<Que componente(s) crear, donde se usa, y cual es su funcion en 2-3 frases.>

## Referencia visual

<Descripcion del diseño: layout, colores, tipografia, comportamiento responsive.>
<Si hay link de Figma, incluirlo.>

## Props

| Prop    | Tipo                     | Requerido | Descripcion                        |
| ------- | ------------------------ | --------- | ---------------------------------- |
| title   | string                   | si        | Titulo principal                   |
| items   | Array<{id, name, image}> | si        | Lista de items a mostrar           |
| variant | 'primary' \| 'secondary' | no        | Variante visual (default: primary) |

## Datos

- Type de `src/core/`: `ActivityProjection` (campos usados: title, image, slug, price)
- Load function: datos vienen de `+page.server.ts` via `ACTIVITY_REQUEST.findByCriteria()`

## Artefactos

- `src/lib/components/marketplace/ComponentName.svelte` — Componente principal
- `src/lib/components/marketplace/ComponentNameItem.svelte` — Item hijo (si aplica)
- `messages/es/marketplace.json` — Keys i18n necesarias (listar)

## Comportamiento

- **Desktop**: <descripcion del layout>
- **Tablet**: <cambios respecto a desktop>
- **Mobile**: <cambios respecto a tablet>
- **Interacciones**: <hover, click, scroll, etc.>
- **Empty state**: <que se muestra si no hay datos>

## Criterios de aceptacion

- [ ] Componente renderiza correctamente con datos reales del API
- [ ] Responsive: se adapta a mobile/tablet/desktop
- [ ] Semantica HTML correcta (headings, landmarks, alt text)
- [ ] Strings via i18n (no hardcoded)
- [ ] Svelte 5 runes only (no legacy syntax)
- [ ] Types-check pasa (`npm run check`)
- [ ] Lint pasa (`npm run lint`)

## Contexto

<Referencia a componentes similares existentes para usar como ejemplo.>
<Patron de props o CSS a reutilizar.>

## Dependencias

- Requiere componente: `ComponenteHijo.svelte` (si no existe, crear primero)
- Requiere datos: endpoint `GET /xxx` (si aplica)
- Requiere: #<issue anterior> (si aplica)

---

Epic: #<padre>
```

**Output**: Lista completa de issues.

**Checkpoint**: Presentar al usuario. Esperar aprobacion.

### Paso 5: Creacion en GitHub

Leer `.claude/docs/github-setup.md` para config del repo y proyecto.

**Labels para marketplace:**

| Label                  | Uso                                                        |
| ---------------------- | ---------------------------------------------------------- |
| `type: feature`        | Nuevo componente o pagina                                  |
| `type: refactor`       | Reestructurar componente existente                         |
| `layer: components`    | Componente en `src/lib/components/marketplace/`            |
| `layer: routes`        | Pagina en `src/routes/(marketplace)/`                      |
| `layer: cross-cutting` | Componente + route + i18n juntos                           |
| `domain: marketplace`  | Siempre para estos issues                                  |
| `context: <recurso>`   | Recurso de API que consume (activities, attractions, etc.) |

**Crear issues:**

1. **Crear hijos primero** (componentes hoja):

   ```bash
   gh issue create \
     --title "feat(marketplace): create ComponentName component" \
     --body "$BODY" \
     --label "type: feature" \
     --label "layer: components" \
     --label "domain: marketplace" \
     --label "context: activities" \
     --label "size: S" \
     --label "priority: medium"
   ```

2. **Asignar Issue Type** via GraphQL:

   ```bash
   ISSUE_NODE_ID=$(gh api graphql -f query='{ repository(owner: "BuendiaTours", name: "buendia-frontend-core") { issue(number: <NUM>) { id } } }' --jq '.data.repository.issue.id')

   gh api graphql -f query="mutation { updateIssue(input: { id: \"$ISSUE_NODE_ID\", issueTypeId: \"IT_kwDOA6vIBc4Atpv_\" }) { issue { number } } }"
   ```

3. **Crear issue padre** con lista de subtareas.

4. **Vincular al proyecto #18**:

   ```bash
   gh project item-add 18 --owner BuendiaTours --url <ISSUE_URL>
   ```

### Paso 6: Verificacion y resumen

Mostrar resumen:

```
Issues creados — Marketplace
=============================
Especificacion: <origen>
Epic: #100 — <titulo>

Componentes:
  #101 — feat(marketplace): create HeroImg component                 [XS] [components]
  #102 — feat(marketplace): create ActivityCard component             [S]  [components]
  #103 — feat(marketplace): create CardsRail component                [M]  [components]
  #104 — feat(marketplace): create PLP page with filters              [M]  [routes]

Total: 1 epic + N subtareas
```

## Reglas

- **Nunca crear issues sin aprobacion** (checkpoints en pasos 2, 3 y 4).
- **Nunca estimar con tiempos de IA**: las estimaciones reflejan esfuerzo humano senior.
- **Siempre verificar si el componente ya existe** en `src/lib/components/marketplace/` o en issues abiertos del kanban antes de proponer uno nuevo.
- **Props tipadas desde `src/core/`**: los issues deben especificar que types del dominio usa el componente, no inventar tipos locales.
- **Cada issue debe ser autocontenido**: Claude debe poder desarrollarlo leyendo solo el issue + CLAUDE.md + componentes existentes similares.
- **No mezclar dominios**: issues de marketplace NO crean nada en `src/lib/components/backoffice/`.
- **Si un componente es complejo (size M+)**, incluir pseudo-codigo del arbol de componentes para que Claude entienda la composicion.
- **Si hay dependencia con datos de API que no existen**, referenciarla como dependencia de backend.
- **Nombrar componentes en PascalCase** sin prefijos `c-` ni `e-` (esos son del sistema legacy de issues, no del codigo).
