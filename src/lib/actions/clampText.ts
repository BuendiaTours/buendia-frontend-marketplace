/**
 * clampText — Svelte action para colapsar/expandir bloques de texto
 *
 * Añade clamping CSS + botón "Leer más / Leer menos" a cualquier elemento de texto.
 * El botón solo aparece cuando el texto está realmente recortado (usa ResizeObserver).
 *
 * Modos de funcionamiento:
 *   - mode: 'text' (default) — usa -webkit-line-clamp. Solo para elementos con texto
 *     directo o hijos inline (<span>, <strong>...). NO funciona con hijos de bloque (<p>, <div>).
 *     Controla el corte con `lines` (número de líneas).
 *   - mode: 'height' — usa max-height + degradado inferior. Funciona con cualquier
 *     contenedor, incluidos <div> con múltiples <p> dentro.
 *     Controla el corte con `height` (px fijos) o con `lines` (calculado desde line-height).
 *     Si se pasan ambos, `height` tiene preferencia.
 *
 * @example Uso básico — texto directo en <p> (3 líneas por defecto)
 *   <p use:clampText>{text}</p>
 *
 * @example Con número de líneas personalizado
 *   <p use:clampText={{ lines: 5 }}>{text}</p>
 *
 * @example Contenedor con varios <p> hijos — altura fija en px
 *   <div use:clampText={{ mode: 'height', height: 200 }}>
 *     <p>{paragraph1}</p>
 *     <p>{paragraph2}</p>
 *   </div>
 *
 * @example Contenedor con varios <p> hijos — altura calculada desde line-height
 *   <div use:clampText={{ mode: 'height', lines: 6 }}>
 *     <p>{paragraph1}</p>
 *     <p>{paragraph2}</p>
 *   </div>
 *
 * @example Solo en mobile (< 768px)
 *   <p use:clampText={{ lines: 4, onlyOn: 'mobile' }}>{text}</p>
 *
 * @example Solo en desktop (>= 1024px)
 *   <p use:clampText={{ lines: 3, onlyOn: 'desktop', breakpoint: 1024 }}>{text}</p>
 *
 * @example Textos personalizados para el botón
 *   <p use:clampText={{ readMore: 'Ver más', readLess: 'Ver menos' }}>{text}</p>
 *
 * @example Clase CSS personalizada para el botón
 *   <p use:clampText={{ buttonClass: 'mi-boton-custom' }}>{text}</p>
 *
 * @example Con key para resetear el estado al cambiar el contenido
 *   (útil cuando el componente se reutiliza con textos distintos, p.ej. en un lightbox)
 *   <p use:clampText={{ lines: 3, key: text }}>{text}</p>
 */

export type ClampTextOptions = {
	mode?: 'text' | 'height';
	lines?: number;
	height?: number;
	readMore?: string;
	readLess?: string;
	onlyOn?: 'mobile' | 'desktop' | 'always';
	breakpoint?: number;
	buttonClass?: string;
	key?: unknown;
};

export function clampText(node: HTMLElement, options: ClampTextOptions = {}) {
	const { mode = 'text' } = options;
	let { lines = 3, height, key } = options;
	const {
		readMore = 'Leer más',
		readLess = 'Leer menos',
		onlyOn = 'always',
		breakpoint = 768,
		buttonClass = 'c-clamp-text__btn'
	} = options;

	let expanded = false;
	let rafId: number;
	let btn: HTMLButtonElement | null = null;
	let active = false;
	let mq: MediaQueryList | null = null;
	let mqHandler: ((e: MediaQueryListEvent) => void) | null = null;

	const observer = new ResizeObserver(() => {
		cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(checkClamped);
	});

	function getMaxHeight() {
		if (height !== undefined) return height;
		const style = getComputedStyle(node);
		let lineHeight = parseFloat(style.lineHeight);
		if (isNaN(lineHeight)) lineHeight = parseFloat(style.fontSize) * 1.2;
		return lineHeight * lines;
	}

	function checkClamped() {
		if (!active) {
			hideButton();
			return;
		}
		if (mode === 'height') {
			node.style.setProperty('--clamp-max-height', `${getMaxHeight()}px`);
		}
		const isClamped = node.scrollHeight > node.clientHeight;
		if (isClamped || expanded) {
			if (!btn) createButton();
			if (btn) btn.hidden = false;
			updateButton();
		} else {
			hideButton();
		}
	}

	function createButton() {
		btn = document.createElement('button');
		btn.className = buttonClass;
		btn.addEventListener('click', toggle);
		node.insertAdjacentElement('afterend', btn);
	}

	function updateButton() {
		if (!btn) return;
		btn.textContent = expanded ? readLess : readMore;
	}

	function hideButton() {
		if (btn) btn.hidden = true;
	}

	function toggle() {
		expanded = !expanded;
		node.classList.toggle('is-expanded', expanded);
		updateButton();
	}

	function enable() {
		active = true;
		if (mode === 'height') {
			node.classList.add('u-clamp-height');
			// max-height se calcula en checkClamped (lazy) para evitar leer
			// getComputedStyle con display:none (p.ej. acordeón cerrado en mobile)
		} else {
			node.classList.add('u-clamp');
			node.style.setProperty('--clamp-lines', String(lines));
		}
		observer.observe(node);
	}

	function disable() {
		active = false;
		expanded = false;
		node.classList.remove('u-clamp', 'u-clamp-height', 'is-expanded');
		node.style.removeProperty('--clamp-lines');
		node.style.removeProperty('--clamp-max-height');
		observer.unobserve(node);
		hideButton();
	}

	if (onlyOn !== 'always') {
		const query =
			onlyOn === 'mobile' ? `(max-width: ${breakpoint - 1}px)` : `(min-width: ${breakpoint}px)`;
		mq = window.matchMedia(query);
		mqHandler = (e) => {
			if (e.matches) enable();
			else disable();
		};
		mq.addEventListener('change', mqHandler);
		if (mq.matches) enable();
	} else {
		enable();
	}

	return {
		update(newOpts: ClampTextOptions = {}) {
			if (newOpts.key !== key) {
				key = newOpts.key;
				expanded = false;
				node.classList.remove('is-expanded');
				updateButton();
			}
			if (newOpts.lines !== undefined && newOpts.lines !== lines) {
				lines = newOpts.lines;
				if (mode === 'height') {
					node.style.setProperty('--clamp-max-height', `${getMaxHeight()}px`);
				} else {
					node.style.setProperty('--clamp-lines', String(lines));
				}
			}
			if (newOpts.height !== undefined && newOpts.height !== height) {
				height = newOpts.height;
				if (mode === 'height') {
					node.style.setProperty('--clamp-max-height', `${getMaxHeight()}px`);
				}
			}
		},
		destroy() {
			observer.disconnect();
			cancelAnimationFrame(rafId);
			if (mq && mqHandler) mq.removeEventListener('change', mqHandler);
			btn?.removeEventListener('click', toggle);
			btn?.remove();
			node.classList.remove('u-clamp', 'u-clamp-height', 'is-expanded');
			node.style.removeProperty('--clamp-lines');
			node.style.removeProperty('--clamp-max-height');
		}
	};
}
