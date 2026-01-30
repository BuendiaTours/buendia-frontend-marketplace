/**
 * Auto-generated enums from API
 * Generated: 2026-01-30T10:27:43.138Z
 * API Base: http://localhost:3333
 * 
 * DO NOT EDIT MANUALLY
 * Run: npm run generate:enums
 */

// ============================================================================
// STAGE KINDS
// ============================================================================

export const STAGE_KINDS = [
  "TRANSFER",
  "EXPERIENCE"
] as const;

export type StageKind = (typeof STAGE_KINDS)[number];

export const STAGE_KINDS_OPTIONS = [
  {
    "id": "TRANSFER",
    "name": "Transfer"
  },
  {
    "id": "EXPERIENCE",
    "name": "Experience"
  }
];

export const STAGE_KINDS_MAP = {
	TRANSFER: {"id":"TRANSFER","name":"Transfer","description":"Movimiento entre puntos (bus, tren, coche, barco, etc.)"},
	EXPERIENCE: {"id":"EXPERIENCE","name":"Experience","description":"Experiencia (visita, comida, show, concierto, etc.)"}
} as const;

// ============================================================================
// STAGE RELEVANCES
// ============================================================================

export const STAGE_RELEVANCES = [
  "HIGH",
  "MEDIUM",
  "LOW",
  "NONE"
] as const;

export type StageRelevance = (typeof STAGE_RELEVANCES)[number];

export const STAGE_RELEVANCES_OPTIONS = [
  {
    "id": "HIGH",
    "name": "Alta"
  },
  {
    "id": "MEDIUM",
    "name": "Media"
  },
  {
    "id": "LOW",
    "name": "Baja"
  },
  {
    "id": "NONE",
    "name": "Ninguna"
  }
];

export const STAGE_RELEVANCES_MAP = {
	HIGH: {"id":"HIGH","name":"Alta","description":"Alta prioridad"},
	MEDIUM: {"id":"MEDIUM","name":"Media","description":"Prioridad media"},
	LOW: {"id":"LOW","name":"Baja","description":"Baja prioridad"},
	NONE: {"id":"NONE","name":"Ninguna","description":"Sin relevancia especial"}
} as const;

// ============================================================================
// STAGE REQUIREMENTS
// ============================================================================

export const STAGE_REQUIREMENTS = [
  "REQUIRED",
  "OPTIONAL",
  "SUGGESTED",
  "NONE"
] as const;

export type StageRequirement = (typeof STAGE_REQUIREMENTS)[number];

export const STAGE_REQUIREMENTS_OPTIONS = [
  {
    "id": "REQUIRED",
    "name": "Obligatorio"
  },
  {
    "id": "OPTIONAL",
    "name": "Opcional"
  },
  {
    "id": "SUGGESTED",
    "name": "Recomendado"
  },
  {
    "id": "NONE",
    "name": "Ninguno"
  }
];

export const STAGE_REQUIREMENTS_MAP = {
	REQUIRED: {"id":"REQUIRED","name":"Obligatorio","description":"Obligatorio para completar la actividad"},
	OPTIONAL: {"id":"OPTIONAL","name":"Opcional","description":"Opcional"},
	SUGGESTED: {"id":"SUGGESTED","name":"Recomendado","description":"Recomendado"},
	NONE: {"id":"NONE","name":"Ninguno","description":"Sin requisito específico"}
} as const;

// ============================================================================
// ACTIVITY STATUSES
// ============================================================================

export const ACTIVITY_STATUSES = [
  "APPROVED",
  "DELETED",
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "REJECTED",
  "UNPUBLISHED"
] as const;

export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export const ACTIVITY_STATUSES_OPTIONS = [
  {
    "id": "APPROVED",
    "name": "Aprobada"
  },
  {
    "id": "DELETED",
    "name": "Borrada"
  },
  {
    "id": "DRAFT",
    "name": "Borrador"
  },
  {
    "id": "PENDING_REVIEW",
    "name": "Pendiente de revisión"
  },
  {
    "id": "PUBLISHED",
    "name": "Publicada"
  },
  {
    "id": "REJECTED",
    "name": "Rechazada"
  },
  {
    "id": "UNPUBLISHED",
    "name": "No publicada"
  }
];

export const ACTIVITY_STATUSES_MAP = {
	APPROVED: {"id":"APPROVED","name":"Aprobada","desc":"APPROVED"},
	DELETED: {"id":"DELETED","name":"Borrada","desc":"DELETED"},
	DRAFT: {"id":"DRAFT","name":"Borrador","desc":"DRAFT"},
	PENDING_REVIEW: {"id":"PENDING_REVIEW","name":"Pendiente de revisión","desc":"PENDING_REVIEW"},
	PUBLISHED: {"id":"PUBLISHED","name":"Publicada","desc":"PUBLISHED"},
	REJECTED: {"id":"REJECTED","name":"Rechazada","desc":"REJECTED"},
	UNPUBLISHED: {"id":"UNPUBLISHED","name":"No publicada","desc":"UNPUBLISHED"}
} as const;
