# Skills Documentation

Esta carpeta contiene **Skills** (habilidades) para optimizar el trabajo con LLMs y agentes AI en este proyecto SvelteKit.

## ¿Qué son los Skills?

Los Skills son guías ejecutables paso a paso que:

- ✅ Reducen el consumo de tokens
- ✅ Mejoran la precisión de las respuestas
- ✅ Aceleran el desarrollo
- ✅ Documentan "la forma correcta" de hacer las cosas
- ✅ Mantienen consistencia en el código

## Skills Disponibles

### 1. `add-form-field.md`

**Para:** Añadir campos a formularios existentes

**Actualiza:**

- `src/lib/types.ts` - Tipos TypeScript
- `src/lib/schemas/*.schema.ts` - Validación Zod
- `src/routes/**/+page.server.ts` - Data handlers
- `src/routes/**/+page.svelte` - UI con componentes

**Uso:**

```bash
# Interactivo
add-form-field

# Con argumentos
add-form-field booking-form guestCount number
```

---

### 2. `add-api-endpoint.md`

**Para:** Añadir nuevos endpoints a la API

**Actualiza:**

- `src/lib/api/endpoints-metadata.ts` - Metadata del endpoint
- `src/lib/api/endpoints/*.ts` - Implementación
- `src/lib/api/index.ts` - Exports (si es nuevo recurso)

**Características:**

- Sigue estructura post-refactor con `.path()`
- Aparece automáticamente en `/api-catalog`
- Tipos TypeScript incluidos

**Uso:**

```bash
# Interactivo
add-api-endpoint

# Con argumentos
add-api-endpoint bookings create POST
```

---

### 3. `create-component.md`

**Para:** Crear componentes reutilizables Svelte

**Incluye:**

- Patrones Svelte 5 con runes
- Templates por tipo de componente
- Documentación JSDoc
- Ejemplos de uso

**Tipos de componentes:**

- Formularios (`forms/`)
- UI generales
- Componentes compartidos

**Uso:**

```bash
# Interactivo
create-component

# Con argumentos
create-component StatusBadge ui
```

---

## Cómo Usar los Skills

### En Windsurf / Cursor / Cline

1. **Modo interactivo (recomendado):**

   ```
   Usa el skill add-form-field para añadir un campo de email
   ```

2. **Referencia directa:**

   ```
   Sigue el workflow de .github/copilot/skills/add-api-endpoint.md
   para crear un endpoint de bookings
   ```

3. **Contexto adicional:**
   ```
   Necesito crear un componente de badge siguiendo create-component.md
   ```

### En OpenCode

1. **Comando directo:**

   ```
   /skill add-form-field
   ```

2. **Con contexto:**
   ```
   Usa el skill para añadir campo maxParticipants type number
   ```

---

## Ventajas de Usar Skills

### Sin Skills ❌

```
Usuario: "Añade un campo de email al formulario de booking"

Agente:
- Pregunta múltiples veces por detalles
- Puede olvidar actualizar types.ts
- Puede usar sintaxis legacy
- No sabe sobre validaciones Zod específicas
- 2000+ tokens en conversación
```

### Con Skills ✅

```
Usuario: "Usa add-form-field para añadir email a booking"

Agente:
- Sabe exactamente qué archivos modificar
- Sigue el workflow establecido
- Usa sintaxis correcta
- Incluye todas las validaciones
- ~500 tokens en conversación
```

**Ahorro:** ~75% menos tokens, resultados más consistentes

---

## Estructura de un Skill

Cada skill sigue esta estructura:

```markdown
# Skill: [Nombre]

[Descripción breve]

## Uso

[Ejemplos de uso]

## ¿Cuándo usar este Skill?

[Casos de uso]

## Workflow Detallado

### Paso 1: [Título]

[Explicación detallada]
[Código de ejemplo]

### Paso 2: [Título]

...

## Errores Comunes y Soluciones

[Problemas típicos y fixes]

## Notas Importantes

[Tips y mejores prácticas]

## Referencias

[Links a documentación relacionada]
```

---

## Creando Nuevos Skills

Si identificas un workflow repetitivo, puedes crear un nuevo skill:

1. **Identifica el patrón:**
   - ¿Qué tarea se repite?
   - ¿Qué archivos se modifican?
   - ¿Qué errores son comunes?

2. **Documenta el workflow:**
   - Paso a paso detallado
   - Código de ejemplo
   - Casos comunes

3. **Crea el archivo:**

   ```bash
   touch .github/copilot/skills/new-skill.md
   ```

4. **Sigue la estructura:**
   - Usa los skills existentes como referencia
   - Incluye ejemplos de código completos
   - Documenta errores comunes

---

## Mantenimiento

### Cuándo actualizar un Skill:

- ✅ Cambios en la estructura del proyecto
- ✅ Nuevas convenciones adoptadas
- ✅ Errores comunes identificados
- ✅ Mejores prácticas descubiertas
- ✅ Feedback de usuarios

### Cómo actualizar:

1. Edita el archivo `.md` correspondiente
2. Añade fecha de actualización al final
3. Documenta cambios en `CHANGELOG` (si existe)
4. Prueba con un agente

---

## Tips para Agentes AI

Al leer estos skills:

1. **Lee el skill completo** antes de empezar
2. **Sigue el orden** de los pasos
3. **No saltes pasos** - cada uno es importante
4. **Verifica** con los checklists incluidos
5. **Consulta ejemplos** cuando tengas dudas

---

## Recursos Adicionales

- **Documentación del proyecto:** `AI.md`
- **Ejemplos de código:** `docs/examples.md`
- **API docs:** `docs/api.md`
- **Página de componentes:** `/components` (navegador)
- **Catálogo API:** `/api-catalog` (navegador)

---

## Feedback

Si un skill:

- No funciona como esperado
- Le falta información
- Tiene errores
- Podría mejorarse

Por favor, actualízalo o reporta el issue.

---

**Última actualización:** 2026-01-28
**Mantenedor:** Equipo de Desarrollo
