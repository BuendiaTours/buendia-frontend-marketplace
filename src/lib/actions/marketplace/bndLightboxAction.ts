import { mount, unmount } from 'svelte';
import BndLightbox from '$lib/components/marketplace/BndLightbox/BndLightbox.svelte';
import type { BndLightboxCategory, BndLightboxConfig, BndLightboxItem } from '$lib/types';

export type BndLightboxActionOptions = {
	defaultCategoryId?: string;
	defaultCategoryLabel?: string;
	wrapAround?: boolean;
	showTitle?: boolean;
};

export function bndLightboxAction(node: HTMLElement, options: BndLightboxActionOptions = {}) {
	let portalDiv: HTMLElement | null = null;
	let instance: ReturnType<typeof mount> | null = null;

	function getTriggers(): HTMLElement[] {
		return Array.from(node.querySelectorAll<HTMLElement>('[data-bndlb-src], img'));
	}

	function buildConfig(startCategoryId: string, startIndex: number): BndLightboxConfig {
		const triggers = getTriggers();
		const defaultCatId = options.defaultCategoryId ?? 'default';
		const defaultCatLabel = options.defaultCategoryLabel ?? 'Galería';
		const categoryMap = new Map<string, { label: string; items: BndLightboxItem[] }>();

		for (const el of triggers) {
			const src = el.dataset.bndlbSrc ?? (el instanceof HTMLImageElement ? el.src : '');
			if (!src) continue;

			const alt = el.dataset.bndlbAlt ?? (el instanceof HTMLImageElement ? el.alt : '');
			const title = el.dataset.bndlbTitle;
			const catId = el.dataset.bndlbCategory ?? defaultCatId;
			const catLabel =
				el.dataset.bndlbCategoryLabel ?? (catId === defaultCatId ? defaultCatLabel : catId);
			const metaStr = el.dataset.bndlbMeta;
			const meta = metaStr ? (JSON.parse(metaStr) as Record<string, unknown>) : undefined;

			if (!categoryMap.has(catId)) {
				categoryMap.set(catId, { label: catLabel, items: [] });
			}
			categoryMap.get(catId)?.items.push({ src, alt: alt || undefined, title, meta });
		}

		const categories: BndLightboxCategory[] = Array.from(categoryMap.entries()).map(
			([id, cat]) => ({ id, label: cat.label, items: cat.items })
		);

		return {
			categories,
			wrapAround: options.wrapAround,
			showTitle: options.showTitle,
			startCategory: startCategoryId,
			startIndex
		};
	}

	function destroyInstance() {
		if (instance) {
			unmount(instance);
			instance = null;
		}
		if (portalDiv) {
			document.body.removeChild(portalDiv);
			portalDiv = null;
		}
	}

	function openLightbox(startCategoryId: string, startIndex: number) {
		destroyInstance();
		const config = buildConfig(startCategoryId, startIndex);
		portalDiv = document.createElement('div');
		document.body.appendChild(portalDiv);
		instance = mount(BndLightbox, {
			target: portalDiv,
			props: { open: true, config, onclose: destroyInstance }
		});
	}

	function handleClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		const trigger = target.closest<HTMLElement>('[data-bndlb-src], img');
		if (!trigger || !node.contains(trigger)) return;

		const triggers = getTriggers();
		const defaultCatId = options.defaultCategoryId ?? 'default';
		const catId = trigger.dataset.bndlbCategory ?? defaultCatId;
		const catTriggers = triggers.filter(
			(el) => (el.dataset.bndlbCategory ?? defaultCatId) === catId
		);
		const catIdx = catTriggers.indexOf(trigger);
		if (catIdx === -1) return;

		e.preventDefault();
		openLightbox(catId, catIdx);
	}

	function addCursors() {
		for (const el of getTriggers()) {
			el.style.cursor = 'pointer';
		}
	}

	addCursors();
	node.addEventListener('click', handleClick);

	return {
		update(newOptions: BndLightboxActionOptions = {}) {
			options = newOptions;
			addCursors();
		},
		destroy() {
			node.removeEventListener('click', handleClick);
			destroyInstance();
		}
	};
}
