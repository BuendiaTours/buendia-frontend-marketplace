import type { MeltDrawerConfig } from './MeltDrawer';
import type { Snippet } from 'svelte';

export type MeltDrawerManagerConfig = MeltDrawerConfig;

export interface MeltDrawerManagerProps<T extends { id: string } = { id: string }> {
	selectedId: string | null;
	items: T[];
	title?: string | ((item: T) => string);
	config?: MeltDrawerManagerConfig;
	content: Snippet<[T]>;
}
