# Sistema de Theming - Buendía Frontend

## 📋 Resumen

Sistema de theming usando **DaisyUI 5.x Native Theme System** con `@plugin "daisyui/theme"`.

## 🎨 Personalizar Temas

**Archivo**: `src/routes/layout.css`

### Variables Principales

#### **Colores Base** (4 variables)

```css
--color-base-100        /* Fondo principal */
--color-base-200        /* Fondo secundario */
--color-base-300        /* Fondo terciario */
--color-base-content    /* Texto sobre base */
```

#### **Colores Semánticos** (16 variables)

```css
--color-primary / --color-primary-content
--color-secondary / --color-secondary-content
--color-accent / --color-accent-content
--color-neutral / --color-neutral-content
```

#### **Estados** (8 variables)

```css
--color-success / --color-success-content
--color-warning / --color-warning-content
--color-error / --color-error-content
--color-info / --color-info-content
```

#### **Variables Personalizadas de Buendía** ⭐

```css
--color-input-border  /* Borde de TODOS los elementos de formulario */
--color-card-border   /* Borde de cards */
```

**La variable `--color-input-border` controla el borde de**:

- ✅ Inputs (text, email, number, password, date, etc.)
- ✅ Textareas
- ✅ Selects
- ✅ Checkboxes
- ✅ Radios
- ✅ File inputs
- ✅ MeltComboBox
- ✅ MeltCalendar / MeltRangeCalendar
- ✅ Contenedores de formulario
- ✅ Details/Accordions

#### **Configuración Visual**

```css
--radius-box          /* Border radius para cards, dialogs */
--radius-btn          /* Border radius para botones */
--radius-badge        /* Border radius para badges */
--border              /* Ancho de bordes (1px, 2px, etc.) */
```

## 🛠️ Ejemplo de Personalización

### Cambiar Color de Bordes de Formularios

**En `src/routes/layout.css`**:

```css
/* Tema Light */
@plugin 'daisyui/theme' {
	name: 'light';
	/* ... */
	--color-input-border: #3b82f6; /* Azul */
}

/* Tema Dark */
@plugin 'daisyui/theme' {
	name: 'dark';
	/* ... */
	--color-input-border: #60a5fa; /* Azul más claro para dark */
}
```

**Resultado**: Todos los inputs, selects, textareas, checkboxes, radios, y componentes de Melt-UI tendrán ese color de borde.

## 🎯 Estado Focus

Cuando un campo de formulario recibe focus, automáticamente usa `--color-primary` para el borde, proporcionando feedback visual al usuario.

## 📚 Referencias

- **DaisyUI Themes**: https://daisyui.com/docs/themes/
- **Tailwind CSS v4**: https://tailwindcss.com/docs

---

**Sistema actualizado**: 2026-02-05
