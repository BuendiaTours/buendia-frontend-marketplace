import { MediaKind, MediaStatus } from '$core/multimedia/enums';
import * as m from '$paraglide/messages';

export const MEDIA_STATUS_OPTIONS = [
	{ id: MediaStatus.PENDING, name: m.enum_mediaStatus_pending() },
	{ id: MediaStatus.PROCESSING, name: m.enum_mediaStatus_processing() },
	{ id: MediaStatus.READY, name: m.enum_mediaStatus_ready() },
	{ id: MediaStatus.FAILED, name: m.enum_mediaStatus_failed() }
];

export const MEDIA_KIND_OPTIONS = [
	{ id: MediaKind.IMAGE, name: m.enum_mediaKind_image() },
	{ id: MediaKind.VIDEO, name: m.enum_mediaKind_video() }
];
