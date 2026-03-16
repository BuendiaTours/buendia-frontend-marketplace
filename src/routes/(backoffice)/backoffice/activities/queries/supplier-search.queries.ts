/**
 * Client-side query functions for async supplier search in activities.
 * Used by FormAsyncSearch to find suppliers.
 */
import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
import { SUPPLIER_REQUEST } from '$core/suppliers/requests';

/** Searches suppliers by name, returning results formatted for FormAsyncSearch. */
export async function searchSuppliers(query: string): Promise<SearchResult[]> {
	try {
		const result = await SUPPLIER_REQUEST.findByCriteria(fetch, {
			search_text: query,
			limit: 10
		});
		return (result.data ?? []).map((s) => ({
			value: s.id,
			label: s.name
		}));
	} catch {
		return [];
	}
}

/** Fetches a single supplier by ID, used to resolve the initial label. */
export async function loadSupplierById(id: string): Promise<SearchResult | undefined> {
	try {
		const supplier = await SUPPLIER_REQUEST.findById(fetch, id);
		return { value: supplier.id, label: supplier.name };
	} catch {
		return undefined;
	}
}
