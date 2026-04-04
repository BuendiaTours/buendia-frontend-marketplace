# Workflow: Desarrollar Issue

## Descripcion

Dado un numero de issue de GitHub, prepara el entorno de desarrollo (branch, kanban), desarrolla la implementacion siguiendo las buenas practicas y skills del proyecto, y al finalizar crea la PR correspondiente. Este workflow envuelve todo el ciclo de vida de desarrollo de una issue del frontend.

## Input requerido

- Numero de issue de GitHub: `$ARGUMENTS`
- Formato: `<issue_number>` (ej: `/code:develop-issue 58`)
- Si `$ARGUMENTS` esta vacio, preguntar al usuario el numero de issue antes de continuar.

## Configuracion local

Antes de ejecutar este workflow, el desarrollador debe tener configurado `.claude/config.local.json` (en `.gitignore`). Este fichero contiene datos especificos de cada desarrollador:

```json
{
	"github_username": "DavidRG"
}
```

```bash
GITHUB_USER=$(cat .claude/config.local.json | jq -r '.github_username')
```

Si el fichero no existe, preguntar al usuario su nombre de usuario de GitHub, crear el fichero y continuar.

## Configuracion del proyecto

Leer `.claude/docs/github-setup.md` al inicio del workflow para obtener todos los IDs del proyecto: repo owner/name, project number, Project Node ID, Status Field ID, columnas del Kanban (Backlog, Ready, In progress, In review, Done) e Issue Type IDs.

## Pasos

### Paso 1: Obtener informacion de la issue

1. Ejecutar:

   ```bash
   gh issue view <number> --json title,labels,milestone,url,body
   ```

2. Extraer del resultado:
   - **Titulo**: para generar nombre de branch
   - **Tipo**: parsear del titulo el prefijo antes de los parentesis (ej: `feat(analytics): ...` -> `feat`)
   - **Scope**: parsear el contenido entre parentesis (ej: `feat(analytics): ...` -> `analytics`)
   - **Descripcion corta**: parsear despues de los dos puntos, slugificar a kebab-case (ej: `add domain layer — types, enums, requests` -> `domain-layer`)
   - **Milestone**: nombre del milestone asociado (ej: `Analytics`)
   - **URL**: para vincular al proyecto
   - **Body**: contenido completo de la issue

3. Si el titulo de la issue no tiene scope entre parentesis, preguntar al usuario cual es la branch base.

4. **Verificar que la issue esta en "Ready" en el Kanban**:

   ```bash
   gh project item-list <PROJECT_NUMBER> --owner <OWNER> --format json | jq -r '.items[] | select(.content.url == "<ISSUE_URL>")'
   ```

   - Obtener el `<ITEM_ID>` (campo `.id`) para usarlo en pasos posteriores.
   - Obtener el status actual (campo `.status`).
   - Si el status es **"Ready"**: continuar con normalidad.
   - Si el status es **cualquier otro valor**: **avisar al usuario** indicando el estado actual y preguntar si desea continuar de todos modos. Solo proceder si el usuario confirma explicitamente.

**Output**: Datos de la issue listos para crear branch + item ID del Kanban + confirmacion de estado.

### Paso 2: Preparar branches

1. **Asegurar el working tree esta limpio**:

   ```bash
   git status --porcelain
   ```

   Si hay cambios sin commitear, avisar al usuario y detener.

2. **Determinar la branch base del scope**:
   - Convencion: `feat/<scope>` derivada del milestone (ej: milestone "Analytics" -> `feat/analytics`, milestone "Backoffice v0" -> `feat/backoffice-v0`)
   - Si no hay milestone, usar el scope del titulo (ej: `feat(analytics)` -> `feat/analytics`)
   - Verificar si existe en remote:
     ```bash
     git fetch origin
     git branch -r | grep "origin/feat/<scope>"
     ```
   - Si NO existe: crearla desde `main`:
     ```bash
     git checkout main
     git pull origin main
     git checkout -b feat/<scope>
     git push -u origin feat/<scope>
     ```
   - Si existe en remote: hacer checkout y pull:
     ```bash
     git checkout feat/<scope>
     git pull origin feat/<scope>
     ```

3. **Crear la branch de la issue** desde la branch base del scope usando `gh issue develop` para vinculacion automatica:
   ```bash
   gh issue develop <number> \
     --base feat/<scope> \
     --name <type>/<number>-<description> \
     --checkout
   ```
   Ejemplo: `gh issue develop 58 --base feat/analytics --name feat/58-analytics-domain-layer --checkout`

**Reglas de naming de branches:**

- Formato: `<type>/<issue-number>-<kebab-case-description>`
- El type viene del titulo de la issue (`feat`, `fix`, `chore`, `refactor`, `docs`)
- La descripcion se acorta a lo esencial (max ~40 caracteres) en kebab-case
- Ejemplos:
  - `feat(analytics): add domain layer — types, enums, requests` -> `feat/58-analytics-domain-layer`
  - `fix(bookings): correct date filter timezone` -> `fix/72-bookings-date-filter-tz`

**Output**: Branch de la issue creada y activa.

### Paso 3: Mover issue a "In progress" y asignar

**IMPORTANTE**: Este paso se ejecuta ANTES de empezar a escribir codigo.

1. **Mover en el Kanban**:

```bash
gh project item-edit \
  --project-id <PROJECT_NODE_ID> \
  --id <ITEM_ID> \
  --field-id <STATUS_FIELD_ID> \
  --single-select-option-id <IN_PROGRESS_OPTION_ID>
```

2. **Asignar la issue al usuario activo**:

```bash
gh issue edit <number> --add-assignee <GITHUB_USER>
```

Si falla por permisos, informar al usuario y continuar sin bloquear.

**Output**: Issue movida a In progress, asignada.

### Paso 4: Analizar la issue y determinar skills

Antes de escribir codigo, analizar el body de la issue para determinar que skills y conocimiento aplicar.

#### 4.1 Clasificar el tipo de trabajo

| Indicador en la issue                            | Skill / Command a usar                                        | Cuando aplicar                                 |
| ------------------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------- |
| Menciona CRUD, list page, form, create/edit page | `/backoffice-crud`                                            | Generar seccion CRUD completa desde core types |
| Crea/edita componentes `.svelte`                 | `svelte-code-writer` + `svelte5-best-practices`               | Siempre que se toque un `.svelte`              |
| Crea/edita `src/core/` types, enums, requests    | Seguir `CLAUDE.md` + `.claude/docs/hexagonal-architecture.md` | Capa de dominio                                |
| Crea/edita schemas Zod                           | Seguir patrones de `CLAUDE.md` seccion Forms                  | Schemas de formulario o filtros                |
| Crea/edita i18n keys                             | Seguir `CLAUDE.md` seccion i18n                               | Traducciones                                   |
| Crea/edita filtros URL-driven                    | Seguir `CLAUDE.md` seccion URL-Driven Filters                 | Filtros de listado                             |
| Instala dependencias nuevas                      | `npm install` + verificar compatibilidad                      | Nuevas librerias                               |

#### 4.2 Leer contexto necesario

Para minimizar el consumo de tokens durante el desarrollo:

1. **Leer SIEMPRE**:
   - `CLAUDE.md` (ya cargado en contexto)
   - El body de la issue (ya obtenido en Paso 1)

2. **Leer segun el tipo de trabajo**:
   - Si toca `src/core/`: leer `src/core/_shared/helpers.ts` y un recurso similar como referencia (ej: `src/core/bookings/`)
   - Si toca routes/components: leer un recurso similar existente para entender el patron (ej: bookings para analytics)
   - Si toca schemas: leer un schema similar existente
   - Si la issue referencia artefactos de issues previas del mismo contexto: leerlos

3. **No leer codigo innecesariamente**:
   - Los patrones estan documentados en `CLAUDE.md` y en los skills
   - Solo leer otros recursos como referencia si el patron no esta claro
   - Nunca usar el subagente Explore cuando las rutas son predecibles
   - Agrupar lecturas en paralelo

#### 4.3 Resolver dependencias de la issue

Si el body menciona "Requiere issue #XX completado", verificar que esos artefactos existen:

```bash
# Verificar que los archivos de issues previas existen
ls src/core/<resource>/types.ts src/core/<resource>/enums.ts ...
```

Si no existen, avisar al usuario y detener.

### Paso 5: Desarrollar

Escribir el codigo siguiendo estrictamente:

1. **`CLAUDE.md`** — Todas las convenciones del proyecto
2. **Skills cargados** — `svelte-code-writer` y `svelte5-best-practices` para todo codigo Svelte
3. **Body de la issue** — Artefactos listados, criterios de aceptacion
4. **Hexagonal architecture** — Respetar las capas (core no importa de lib/app)

**Reglas criticas durante el desarrollo:**

- **Svelte 5 only**: `$props()`, `$derived()`, `$state()`, `$effect()`, `onclick`, snippets. Nunca legacy.
- **i18n everywhere**: Nunca hardcodear strings visibles al usuario. Usar `m.*()` de Paraglide.
- **URL-driven filters**: La URL es la fuente de verdad para filtros, paginacion y sort.
- **Prices in cents**: El API devuelve precios en cents. Convertir a euros solo en la capa de presentacion.
- **CQRS delays**: Despues de create/update/delete, respetar `redirectDelayMs` (default 500ms).
- **`use:enhance`**: En TODOS los forms, incluyendo delete.
- **Type imports**: Usar `import type { ... }` para imports solo de tipos.
- **Tailwind v4 + DaisyUI**: Para estilos. Sin inline styles ni CSS modules.

### Paso 5b: Verificaciones automaticas

Antes de pedir review al usuario, ejecutar:

```bash
npm run check    # Type-check
npm run lint     # Prettier + ESLint
```

Si hay errores:

- **Type errors**: Corregirlos antes de continuar.
- **Lint errors**: Ejecutar `npm run format` y luego `npm run lint` de nuevo.
- Si persisten errores despues de 2 intentos, mostrar los errores al usuario.

### Paso 5c: Revision manual del usuario

**IMPORTANTE**: Despues de las verificaciones automaticas, **siempre pedir confirmacion al usuario** antes de commitear.

Mostrar al usuario:

```
REVIEW TIME

El codigo esta listo para revision.
Revisa los cambios en tu editor y confirma cuando quieras continuar con el commit.

Esperando tu confirmacion...
```

Opciones:

- Listo, continuar con commit
- He hecho cambios, vuelve a verificar (relanza npm run check + lint)
- Descartar y parar

Este paso es **obligatorio** y no se puede saltar.

### Paso 6: Commit

Usar el command `/git:commit` para analizar los cambios y crear commits atomicos siguiendo Conventional Commits.

### Paso 7: Push y crear PR

1. **Push de la branch**:

   ```bash
   git push -u origin <type>/<number>-<description>
   ```

2. **Crear la PR** apuntando a la branch base del scope:

   ```bash
   gh pr create \
     --base feat/<scope> \
     --title "<type>(<scope>): <descripcion de la issue>" \
     --body "$(cat <<'PREOF'
   ## Issue

   Closes #<number>

   ## Descripcion

   <resumen de lo implementado, 3-5 bullet points>

   ## Checklist

   - [ ] Type-check pasa (`npm run check`)
   - [ ] Lint pasa (`npm run lint`)
   - [ ] Sigue convenciones de `CLAUDE.md`
   - [ ] Svelte 5 runes only (no legacy)
   - [ ] Strings internacionalizados (no hardcoded)
   PREOF
   )"
   ```

**IMPORTANTE**: No anadir la PR al GitHub Project. Solo las issues pertenecen al Kanban. La PR queda vinculada automaticamente via `Closes #<number>`.

**Output**: PR creada y vinculada a la issue.

### Paso 8: Mover issue a "In review"

1. **Mover en el Kanban**:

```bash
gh project item-edit \
  --project-id <PROJECT_NODE_ID> \
  --id <ITEM_ID> \
  --field-id <STATUS_FIELD_ID> \
  --single-select-option-id <IN_REVIEW_OPTION_ID>
```

2. **Comentar en la issue con el link a la PR**:

```bash
gh issue comment <number> --body "PR ready for review: #<pr-number>"
```

**Output**: Issue en "In review", con link a la PR.

### Paso 9: Resumen final

Mostrar al usuario:

```
Issue #<number> — Desarrollo completado
==========================================
Branch:     <type>/<number>-<description>
Base:       feat/<scope>
PR:         #<pr-number> (<pr-url>)
Kanban:     In review
Commits:    <lista de commits realizados>
Checks:     npm run check OK / npm run lint OK
```

## Reglas

- **Nunca escribir codigo sin haber leido el body de la issue y `CLAUDE.md`.**
- **Nunca hacer push sin confirmacion del usuario** en el paso 5c.
- **Nunca crear la PR sin que `npm run check` y `npm run lint` pasen.**
- **Si el working tree no esta limpio** al empezar, detener y avisar al usuario.
- **Si la branch de la issue ya existe**, preguntar al usuario si quiere hacer checkout o recrearla.
- **Si la branch base del scope no existe**, crearla desde `main` automaticamente.
- **Si falla mover en el Kanban** por permisos, continuar sin bloquear. Informar al usuario.
- **El titulo de la PR** sigue Conventional Commits, igual que el titulo de la issue.
- **El body de la PR** referencia la issue con `Closes #<number>` para auto-cierre.
- **Antes de crear la PR**, verificar que la branch base existe en remote. Si no, push primero.
- **Usar skills cuando aplique**: `svelte-code-writer` y `svelte5-best-practices` para componentes Svelte, `/backoffice-crud` si la issue es un CRUD completo.
- **Nunca incluir atribucion de IA** en commits, codigo o PRs.
