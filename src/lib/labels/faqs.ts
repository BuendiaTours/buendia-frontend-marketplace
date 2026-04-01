import { FaqStatus } from '$core/faqs/enums';
import * as m from '$paraglide/messages';

export const FAQ_STATUS_OPTIONS = [
	{ id: FaqStatus.DRAFT, name: m.enum_faqStatus_draft() },
	{ id: FaqStatus.PUBLISHED, name: m.enum_faqStatus_published() }
];
