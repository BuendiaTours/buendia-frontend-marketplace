# Workflow: Completar Issue

## Descripcion

Cierra el ciclo de vida de una issue de GitHub tras el merge de su PR: mueve el ticket a Done en el Kanban del proyecto, y si la issue tiene referencia a un epic de Jira, deja un comentario de progreso en Jira para que negocio tenga visibilidad.

## Input requerido

- Numero de issue de GitHub: `$ARGUMENTS`
- Formato: numero de issue (ej: `/management:complete-issue 58`)
- Si `$ARGUMENTS` esta vacio, preguntar al usuario que proporcione el numero de issue.

## Configuracion del proyecto

Leer `.claude/docs/github-setup.md` al inicio del workflow para obtener: repo owner/name, project number, Project Node ID, Status Field ID y columna Done option ID.

## Pasos

### Paso 1: Obtener informacion de la issue

1. Obtener los datos de la issue:

   ```bash
   gh issue view <number> --repo BuendiaTours/buendia-frontend-core --json title,labels,body,url,state,milestone
   ```

2. Extraer titulo, estado, URL, milestone y body.
3. Verificar que la issue esta **cerrada** (state = CLOSED). Si no lo esta, avisar al usuario y preguntar si desea continuar igualmente.

### Paso 2: Verificar que la PR fue mergeada

1. Buscar PRs mergeadas asociadas a la issue:

   ```bash
   gh pr list --repo BuendiaTours/buendia-frontend-core --search "<number>" --state merged --json number,title,url,mergedAt
   ```

2. Si no hay ninguna PR mergeada asociada, **avisar y detener**. No se debe completar una issue sin PR mergeada.
3. Capturar numero de PR, URL y fecha de merge.

### Paso 3: Mover issue a "Done" en el Kanban de GitHub

1. Obtener el item ID de la issue en el proyecto (usar `<PROJECT_NUMBER>` y `<OWNER>` de `github-setup.md`):

   ```bash
   gh project item-list <PROJECT_NUMBER> --owner <OWNER> --format json --limit 100 | jq -r '.items[] | select(.content.url == "<ISSUE_URL>")'
   ```

2. Mover a Done (usar `<PROJECT_NODE_ID>`, `<STATUS_FIELD_ID>` y `<DONE_OPTION_ID>` de `github-setup.md`):

   ```bash
   gh project item-edit \
     --project-id <PROJECT_NODE_ID> \
     --id <ITEM_ID> \
     --field-id <STATUS_FIELD_ID> \
     --single-select-option-id <DONE_OPTION_ID>
   ```

3. Si falla por permisos o porque la issue no esta en el proyecto, **informar y continuar** sin bloquear el resto del workflow.

### Paso 4: Actualizar progreso en Jira

> **Principio de eficiencia**: El progreso se deriva desde GitHub (fuente de verdad) en lugar de leer comentarios de Jira. Esto reduce el consumo de tokens y es mas fiable.

1. Parsear el body de la issue para encontrar las referencias:
   - **Jira**: Buscar patron `Jira: PE-XX` o `Jira: [PE-XX](...)`. Extraer `PE-XX`.
   - **Epic de GitHub**: Buscar patron `Epic: #<num>`. Extraer el numero del epic.

2. Si **no se encuentra referencia a Jira**, intentar obtenerla del epic de GitHub (paso 4.4). Si tampoco hay epic, saltar este paso e informar al usuario.

3. Si **no se encuentra `Epic: #<num>`** en el body de la issue:
   - Fallback: buscar el epic de GitHub por milestone:
     ```bash
     gh issue list --repo BuendiaTours/buendia-frontend-core --milestone "<milestone>" --state all --json number,title,body | jq '.[] | select(.title | test("^[A-Z].*MVP|^[A-Z].*Epic|Dashboard") | not | not)'
     ```
   - Buscar la issue cuyo body contiene `## Subtareas` y referencia al numero de la issue actual.
   - Si no se encuentra, usar el **fallback Jira** (paso 4.5).

4. Si se encuentra el epic de GitHub, **derivar progreso desde GitHub**:
   1. Obtener la lista de subtareas del epic:
      ```bash
      gh issue view <epic-num> --repo BuendiaTours/buendia-frontend-core --json body
      ```
      Parsear la seccion `## Subtareas` para extraer: numeros de issue, titulos, sizes y layers.
   2. Comprobar el estado real de cada subtarea en GitHub:
      - Obtener el `state` de todas las subtareas:
        ```bash
        for num in <subtask_numbers>; do
          gh issue view $num --repo BuendiaTours/buendia-frontend-core --json number,state --jq '"\(.number):\(.state)"'
        done
        ```
      - Para issues con `state: OPEN`, verificar si tienen una PR mergeada:
        ```bash
        for num in <open_subtask_numbers>; do
          gh pr list --repo BuendiaTours/buendia-frontend-core --search "$num" --state merged --json number --jq '"'"$num"':merged=" + (length | tostring)'
        done
        ```
      - Una issue es **completada** si: `state: CLOSED` **O** tiene al menos una PR mergeada.
      - La issue actual siempre se cuenta como completada (su PR acaba de mergearse).
   3. Calcular el progreso: `completadas / total`.
   4. Extraer la referencia a Jira del body del epic si no se encontro en la issue.

5. **(Fallback Jira)** — Solo si no se pudo obtener la lista de subtareas desde GitHub:
   1. Obtener el epic de Jira con `getJiraIssue` (cloudId: `buendiatours.atlassian.net`, issueIdOrKey: PE-XX, fields: `["comment", "summary"]`).
   2. Buscar el comentario que contiene "Issues tecnicos creados en GitHub (Frontend)" para extraer la lista de subtareas.
   3. Buscar el ultimo comentario de progreso para obtener las subtareas ya completadas.
   4. Construir la lista actualizada.

6. Anadir un nuevo comentario en el epic de Jira con `addCommentToJiraIssue` (contentFormat: `markdown`) que **replique la lista completa de subtareas con los emojis actualizados**:

   ```markdown
   ## Progreso: X/N subtareas completadas

   Subtareas:

   - ✅ #<num> — <titulo> [<size>] [<layer>]
   - ✅ #<num> — <titulo> [<size>] [<layer>]
   - ⬜ #<num> — <titulo> [<size>] [<layer>]
   - ...

   ---

   Ultima completada: #<number> — <titulo de la issue>
   PR: #<pr-number> (merged <fecha>)
   ```

   > **Cada comentario es un snapshot completo del progreso**. Esto compensa que el MCP Atlassian no permite editar comentarios (solo crear). Negocio siempre ve el estado actual mirando el ultimo comentario.

7. Si falla por permisos, **informar y continuar** sin bloquear.

### Paso 5: Resumen final

Mostrar al usuario un resumen del resultado:

```
Issue #<number> — Completada
==============================
Issue:    #<number> — <titulo>
PR:       #<pr-number> (merged)
Kanban:   Done
Jira:     PE-XX — Comentario de progreso anadido (X/N)
```

Si algun paso fallo, reflejarlo en el resumen:

```
Issue #<number> — Completada (parcial)
========================================
Issue:    #<number> — <titulo>
PR:       #<pr-number> (merged)
Kanban:   No se pudo mover (motivo)
Jira:     PE-XX — Comentario de progreso anadido (X/N)
```

## Reglas

- **Nunca mover a Done sin verificar que la PR fue mergeada.** Este es un requisito bloqueante.
- **Si la issue no tiene referencia a Jira**, solo completar el lado de GitHub y avisar. No es un error, simplemente no hay trazabilidad Jira para esa issue.
- **Si falla el Kanban o Jira por permisos**, continuar con el resto del workflow e informar. No bloquear el proceso completo por un fallo parcial.
- **No crear commits ni modificar codigo.** Este workflow es exclusivamente de gestion.
- **Siempre usar `--repo BuendiaTours/buendia-frontend-core`** en los comandos `gh` para evitar problemas con el remote origin.
- **Cloud ID de Jira**: `buendiatours.atlassian.net`.
