# Workflow: Crear Issues Frontend desde Especificacion

## Descripcion

Recibe una especificacion funcional (epic de Jira, descripcion libre, o referencia a un documento), la analiza desde la perspectiva frontend de este proyecto SvelteKit, la descompone en issues tecnicos de GitHub y los sube al repositorio. Produce un issue padre (epic tecnico) con subtareas vinculadas.

## Contexto del proyecto

Antes de analizar, lee estos archivos para entender la arquitectura:

- `CLAUDE.md` — Convenciones, estructura, patrones
- `.claude/docs/hexagonal-architecture.md` — Capas y reglas de dependencia
- `.claude/docs/github-setup.md` — Repo, proyecto, labels, issue types

## Capas del frontend (para descomponer issues)

| Capa              | Directorio                              | Que contiene                                |
| ----------------- | --------------------------------------- | ------------------------------------------- |
| **Core (Domain)** | `src/core/[resource]/`                  | Types, enums, requests (framework-agnostic) |
| **Labels**        | `src/lib/labels/`                       | Enum-to-display mapping con i18n            |
| **Components**    | `src/lib/components/`                   | UI reutilizable (forms, tables, filters)    |
| **Routes**        | `src/routes/(backoffice\|marketplace)/` | Pages, server loads, actions, schemas       |
| **Config**        | `src/lib/config/`                       | Rutas, navegacion, constantes               |
| **i18n**          | `messages/`                             | Traducciones JSON por locale                |
| **Server**        | `src/lib/server/`                       | Action factories, flash messages            |

## Input requerido

- Especificacion: `$ARGUMENTS`
- Formatos aceptados:
  - Jira epic: `PE-XXX` (se obtiene via MCP Jira si disponible, sino pedir que peguen la descripcion)
  - Descripcion libre: texto con el requisito funcional
  - URL de Confluence o documento
- Si `$ARGUMENTS` esta vacio, preguntar al usuario que describa lo que necesita.

## Pasos

### Paso 1: Obtener y entender el requisito

1. Si es un PE-XXX, intentar obtenerlo de Jira. Si no hay MCP Jira, pedir al usuario que pegue la descripcion.
2. Extraer:
   - **Que quiere el usuario** (requisito funcional).
   - **Donde se ve** (backoffice, marketplace, ambos).
   - **Que recursos/entidades estan involucrados**.
   - **Criterios de aceptacion** (si vienen definidos).

### Paso 2: Analisis tecnico frontend

1. **Identificar recursos afectados.**
   - Listar los `src/core/[resource]/` que se ven impactados.
   - Para recursos nuevos: marcar que hay que crear types, enums, requests.
   - Para recursos existentes: leer sus tipos actuales y ver que falta.

2. **Clasificar cambios por capa.** Para cada pieza del requisito:

   | Tipo de cambio                     | Ejemplo                                     |
   | ---------------------------------- | ------------------------------------------- |
   | Nuevo recurso completo             | CRUD de un nuevo entity                     |
   | Nueva seccion en recurso existente | Añadir tab de multimedia a actividades      |
   | Nuevos campos en formulario        | Añadir campo duracion a opciones            |
   | Nuevo filtro en listado            | Filtro por estado en lista de reservas      |
   | Cambio de UI/UX                    | Reemplazar selector por workflow de estados |
   | Integracion con sistema externo    | Mapeo de tickets con booking system         |
   | Solo lectura (detail page)         | Mostrar info de pago en detalle de reserva  |

3. **Listar artefactos afectados por capa:**
   - **Core**: nuevos/modificados types.ts, enums.ts, requests.ts
   - **Labels**: nuevos arrays de opciones para enums
   - **i18n**: nuevas keys de traduccion (labels, placeholders, enums, mensajes)
   - **Schemas**: nuevos/modificados Zod schemas (form, filters)
   - **Routes**: nuevas/modificadas pages (+page.svelte, +page.server.ts)
   - **Components**: nuevos/modificados componentes (forms, accordions, actions)
   - **Config**: nuevas rutas, entradas de navegacion, breadcrumbs

4. **Identificar dependencias:**
   - Con el backend: endpoints que deben existir, DTOs esperados.
   - Entre recursos: relaciones, lookups cruzados.
   - Con el backend repo (BuendiaTours/buendia-backend-core): si hay issues de backend necesarios, referenciarlos.

**Output**: Analisis tecnico con artefactos por capa y dependencias.

**Checkpoint**: Presentar el analisis al usuario. Esperar aprobacion antes de continuar.

### Paso 3: Discusion de UX y diseño

Antes de descomponer en issues, discutir decisiones de UX con el usuario:

1. **Listado**: que columnas mostrar, que filtros exponer, que campos son ordenables.
2. **Formulario**: como agrupar los campos (secciones de FormAccordion), que campos son requeridos vs opcionales.
3. **Workflows**: si hay flujos de estado (publicar/despublicar), como se presentan.
4. **Sub-recursos**: si hay relaciones gestionables (tags, categorias, multimedia), como se manejan (tab, accordion, inline).
5. **Validaciones**: que validaciones tiene el formulario (min/max, patterns, custom).

Para cada pregunta, proponer una respuesta razonada basada en como lo hacen recursos similares del proyecto. El usuario confirma o ajusta.

**Checkpoint**: Decisiones de UX aprobadas. Proceder a descomponer.

### Paso 4: Descomposicion en issues

**Criterio de granularidad:**

- Cambio **grande** (nuevo CRUD completo, >= size S): un issue por capa logica.
- Cambio **pequeño** (nuevos campos, nuevo filtro, size XS): un unico issue cross-cutting.
- Cambio **medio** (nueva seccion/tab): 2-3 issues (core+schema, routes+components, i18n+config).

**Estructura de cada issue hijo:**

```markdown
## Descripcion

<Que hay que hacer y por que, en 2-3 frases.>

## Artefactos

<Lista de archivos a crear o modificar, con lo que cambia en cada uno.>

### Core

- `src/core/[resource]/types.ts` — Añadir XxxProjection, XxxCreateDto, XxxCriteria
- `src/core/[resource]/enums.ts` — Añadir XxxStatus enum
- `src/core/[resource]/requests.ts` — CRUD request functions

### Routes

- `src/routes/(backoffice)/backoffice/[resource]/+page.server.ts` — List load
- `src/routes/(backoffice)/backoffice/[resource]/+page.svelte` — List page
  ...

## Criterios de aceptacion

- [ ] <criterio concreto y verificable>
- [ ] <criterio concreto y verificable>
- [ ] Types-check pasa (`npm run check`)
- [ ] Lint pasa (`npm run lint`)

## Contexto

<Decisiones de UX tomadas en el paso 3 relevantes para este issue.>
<Referencia a recursos similares del proyecto para usar como ejemplo.>

## Dependencias

- Requiere backend endpoint: `GET /xxx`, `POST /xxx` (si aplica)
- Requiere: #<issue anterior> completado (si aplica)

---

Epic: #<padre>
```

**Orden de dependencias:**

1. Core (types, enums, requests) — siempre primero
2. Labels + i18n — despues de core (necesitan los enums)
3. Config (routes, nav) — en paralelo con labels
4. Schemas — despues de core (necesitan los types/enums)
5. Routes + Components — ultimo (necesitan todo lo anterior)

**Regla de tamaño**: si una subtarea sale `size: XL`, hay que partirla. Proponer la particion.

**Output**: Lista completa de issues con titulo, body, labels.

**Checkpoint**: Presentar la propuesta al usuario. Esperar aprobacion.

### Paso 5: Creacion en GitHub

Leer `.claude/docs/github-setup.md` para obtener repo, project, issue type IDs y labels.

**Antes de crear, verificar que las labels necesarias existen:**

```bash
gh label list --limit 100
```

Si falta alguna label (ej: `context: nuevo-recurso`), crearla:

```bash
gh label create "context: nuevo-recurso" --color "c5def5"
```

Y actualizar `.claude/docs/github-setup.md` con la nueva label.

**Crear issues:**

1. **Crear hijos primero** (para tener sus numeros):

   ```bash
   gh issue create \
     --title "feat(resource): add domain layer (types, enums, requests)" \
     --body "$BODY" \
     --label "type: feature" \
     --label "layer: core" \
     --label "domain: backoffice" \
     --label "context: resource" \
     --label "size: XS" \
     --label "priority: medium"
   ```

2. **Asignar Issue Type** a cada issue creado:

   ```bash
   ISSUE_NODE_ID=$(gh api graphql -f query='{ repository(owner: "BuendiaTours", name: "buendia-frontend-core") { issue(number: <NUM>) { id } } }' --jq '.data.repository.issue.id')

   gh api graphql -f query="mutation { updateIssue(input: { id: \"$ISSUE_NODE_ID\", issueTypeId: \"<TYPE_ID>\" }) { issue { number } } }"
   ```

   Mapeo de prefijo a Issue Type:

   | Prefijo                       | Issue Type ID                   |
   | ----------------------------- | ------------------------------- |
   | `fix(...)`                    | `IT_kwDOA6vIBc4Atpv9` (Bug)     |
   | `feat(...)`                   | `IT_kwDOA6vIBc4Atpv_` (Feature) |
   | `chore(...)`, `refactor(...)` | `IT_kwDOA6vIBc4Atpv6` (Task)    |
   | Epics (sin prefijo)           | `IT_kwDOA6vIBc4Atpv6` (Task)    |

3. **Crear issue padre** con la lista de subtareas:

   ```markdown
   ## Subtareas

   - #<num> — <titulo> [<size>] [<layer>]
   - #<num> — <titulo> [<size>] [<layer>]
   ```

4. **Vincular issues al proyecto**:

   ```bash
   gh project item-add 18 --owner BuendiaTours --url <ISSUE_URL>
   ```

### Paso 6: Verificacion y resumen

1. Verificar con `gh issue list --label "context: <ctx>" --state open`.
2. Mostrar resumen:

```
Issues creados — Resumen
========================
Especificacion: <origen>
Epic tecnico: #100 — <titulo>

Subtareas:
  #101 — feat(resource): add domain layer                   [XS] [core]
  #102 — feat(resource): add labels, i18n and route config  [XS] [config]
  #103 — feat(resource): add list page with filters         [S]  [routes]
  #104 — feat(resource): add create and edit pages          [S]  [routes]

Total: 1 epic + N subtareas
```

## Reglas

- **Nunca crear issues sin aprobacion** (checkpoints en pasos 2, 3 y 4).
- **Nunca estimar con tiempos de IA**: las estimaciones reflejan esfuerzo humano senior.
- **Siempre referenciar recursos similares** del proyecto como ejemplo en los issues (ej: "ver como esta implementado en locations").
- **Siempre incluir criterios de aceptacion verificables** (no "funciona bien", sino "el filtro por estado filtra la lista").
- **Siempre asignar labels completos**: type + layer + domain + context + size + priority.
- **Si hay dependencia de backend**, referenciarla explicitamente. No asumir que los endpoints existen.
- **Si el requisito implica un CRUD completo**, referenciar el command `/backoffice-crud` en el issue correspondiente para que Claude lo use al desarrollar.
- **Cada issue debe ser autocontenido**: Claude debe poder desarrollarlo leyendo solo el issue + CLAUDE.md + los archivos referenciados.
- **No crear issues para lo que ya existe**. Antes de proponer, verificar si el recurso/pagina ya esta implementado.
