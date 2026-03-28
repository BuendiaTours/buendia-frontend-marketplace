import { ContentBlockKind } from '$core/content-blocks/enums';
import * as m from '$paraglide/messages';

export const CONTENT_BLOCK_KIND_OPTIONS = [
	{ id: ContentBlockKind.ACTIVITY, name: m.enum_contentBlockKind_activity() },
	{ id: ContentBlockKind.URL, name: m.enum_contentBlockKind_url() }
];
