import * as m from '$paraglide/messages';

// Array de las claves
// STAGE_KINDS_OPTIONS.map((option) => option.id) as [string, ...string[]]

///////////////////////////////////////
// Activities
///////////////////////////////////////

export const ACTIVITY_STATUS_OPTIONS = [
	{ id: 'APPROVED', name: 'Aprobada' },
	{ id: 'DELETED', name: 'Eliminada' },
	{ id: 'DRAFT', name: 'Borraor' },
	{ id: 'PENDING_REVIEW', name: 'Pendiente de revisión' },
	{ id: 'PUBLISHED', name: 'Publicada' },
	{ id: 'REJECTED', name: 'Rechazada' },
	{ id: 'UNPUBLISHED', name: 'No publicada' }
] as const;

export type ActivityStatus = (typeof ACTIVITY_STATUS_OPTIONS)[number]['id'];
export const ACTIVITY_STATUS_VALUES = ACTIVITY_STATUS_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];

export const ACTIVITY_KIND_OPTIONS = [
	{ id: 'PAID_TOUR', name: 'Tour pagado' },
	{ id: 'FREE_TOUR', name: 'Tour gratuito' },
	{ id: 'OTHER', name: 'Otro' }
];

export type ActivityKind = (typeof ACTIVITY_KIND_OPTIONS)[number]['id'];
export const ACTIVITY_KIND_VALUES = ACTIVITY_KIND_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];

export const ACTIVITY_GUIDE_KIND_OPTIONS = [
	{ id: 'AUTO', name: 'Auto' },
	{ id: 'CUSTOM_LANGUAGE', name: 'Idioma personalizado' },
	{ id: 'DRIVER', name: 'Conductor' },
	{ id: 'GUEST', name: 'Invitado' },
	{ id: 'INSTRUCTOR', name: 'Instructor' }
];

export type ActivityGuideKind = (typeof ACTIVITY_GUIDE_KIND_OPTIONS)[number]['id'];
export const ACTIVITY_GUIDE_KIND_VALUES = ACTIVITY_GUIDE_KIND_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];

export const ACTIVITY_NOT_SUITABLE_FOR_OPTIONS = [
	{ id: 'ADULTS', name: 'Adultos' },
	{ id: 'CHILDREN', name: 'Niños' },
	{ id: 'FAMILIES', name: 'Familias' },
	{ id: 'GROUPS', name: 'Grupos' },
	{ id: 'INDIVIDUALS', name: 'Individuos' }
] as const;

export type ActivityNotSuitableFor = (typeof ACTIVITY_NOT_SUITABLE_FOR_OPTIONS)[number]['id'];
export const ACTIVITY_NOT_SUITABLE_FOR_VALUES = ACTIVITY_NOT_SUITABLE_FOR_OPTIONS.map(
	(opt) => opt.id
) as [string, ...string[]];

export const ACTIVITY_RESTRICTION_OPTIONS = [
	{ id: 'ALCOHOL', name: 'Alcohol' },
	{ id: 'SMOKING', name: 'Fumador' },
	{ id: 'PETS', name: 'Mascotas' },
	{ id: 'OTHER', name: 'Otro' }
];

export type ActivityRestriction = (typeof ACTIVITY_RESTRICTION_OPTIONS)[number]['id'];
export const ACTIVITY_RESTRICTION_VALUES = ACTIVITY_RESTRICTION_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];

///////////////////////////////////////
// Stages
///////////////////////////////////////

export const STAGE_REQUIREMENT_OPTIONS = [
	{ id: 'REQUIRED', name: 'Requerido' },
	{ id: 'OPTIONAL', name: 'Opcional' },
	{ id: 'CONDITIONAL', name: 'Condicional' }
] as const;

export type StageRequirement = (typeof STAGE_REQUIREMENT_OPTIONS)[number]['id'];
export const STAGE_REQUIREMENT_VALUES = STAGE_REQUIREMENT_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];

export const STAGE_KIND_OPTIONS = [
	{
		id: 'TRANSFER',
		name: m.enums_stageKinds_transfer_name(),
		description: m.enums_stageKinds_transfer_description()
	},
	{
		id: 'EXPERIENCE',
		name: m.enums_stageKinds_experience_name(),
		description: m.enums_stageKinds_experience_description()
	}
] as const;

export type StageKind = (typeof STAGE_KIND_OPTIONS)[number]['id'];
export const STAGE_KIND_VALUES = STAGE_KIND_OPTIONS.map((opt) => opt.id) as [string, ...string[]];

export const STAGE_RELEVANCE_OPTIONS = [
	{ id: 'HIGH', name: 'Alta' },
	{ id: 'MEDIUM', name: 'Media' },
	{ id: 'LOW', name: 'Baja' },
	{ id: 'NONE', name: 'Ninguna' }
] as const;

export type StageRelevance = (typeof STAGE_RELEVANCE_OPTIONS)[number]['id'];
export const STAGE_RELEVANCE_VALUES = STAGE_RELEVANCE_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];

///////////////////////////////////////
// Attractions
///////////////////////////////////////

export const ATTRACTION_STATUS_OPTIONS = [
	{ id: 'ACTIVE', name: 'Activo' },
	{ id: 'DRAFT', name: 'Borrador' },
	{ id: 'INACTIVE', name: 'Inactivo' }
] as const;

export type AttractionStatus = (typeof ATTRACTION_STATUS_OPTIONS)[number]['id'];
export const ATTRACTION_STATUS_VALUES = ATTRACTION_STATUS_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];

///////////////////////////////////////
// Destinations
///////////////////////////////////////

export const DESTINATION_KIND_OPTIONS = [
	{ id: 'CITY', name: 'Ciudad' },
	{ id: 'REGION', name: 'Región' },
	{ id: 'COUNTRY', name: 'País' }
] as const;

export type DestinationKind = (typeof DESTINATION_KIND_OPTIONS)[number]['id'];
export const DESTINATION_KIND_VALUES = DESTINATION_KIND_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];

///////////////////////////////////////
// Meals
///////////////////////////////////////

export const MEAL_FORMAT_OPTIONS = [
	{ id: 'BARBECUE', name: 'Barbacoa' },
	{ id: 'BUFFET', name: 'Buffet' },
	{ id: 'COMPLETE', name: 'Completo' },
	{ id: 'COURSE', name: 'Curso' },
	{ id: 'PICNIC', name: 'Picnic' },
	{ id: 'SNACK', name: 'Snack' },
	{ id: 'TAKE_AWAY', name: 'TPara llevar' },
	{ id: 'TASTING', name: 'Degustación' }
];

export type MealFormat = (typeof MEAL_FORMAT_OPTIONS)[number]['id'];
export const MEAL_FORMAT_VALUES = MEAL_FORMAT_OPTIONS.map((opt) => opt.id) as [string, ...string[]];

export const MEAL_KIND_OPTIONS = [
	{ id: 'BREAKFAST', name: 'Desayuno' },
	{ id: 'BRUNCH', name: 'Brunch' },
	{ id: 'PENDING_HOUR', name: 'Dependiendo de la hora' },
	{ id: 'DINNER', name: 'Cena' },
	{ id: 'LUNCH', name: 'Almuerzo' },
	{ id: 'OTHER', name: 'Otro' }
];

export type MealKind = (typeof MEAL_KIND_OPTIONS)[number]['id'];
export const MEAL_KIND_VALUES = MEAL_KIND_OPTIONS.map((opt) => opt.id) as [string, ...string[]];

export const MEAL_ADDITIONAL_OPTIONS = [
	{ id: 'VEGETARIAN', name: 'Vegetariana' },
	{ id: 'VEGAN', name: 'Vegana' },
	{ id: 'GLUTEN_FREE', name: 'Sin gluten' },
	{ id: 'LACTOSE_FREE', name: 'Sin lactosa' },
	{ id: 'NUT_FREE', name: 'Sin frutos secos' },
	{ id: 'SOY_FREE', name: 'Sin soja' },
	{ id: 'MUSHROOM_FREE', name: 'Sin setas' },
	{ id: 'SEAFOOD_FREE', name: 'Sin pescado' },
	{ id: 'SHELLFISH_FREE', name: 'Sin mariscos' },
	{ id: 'EGG_FREE', name: 'Sin huevos' },
	{ id: 'PALEO', name: 'Paleo' },
	{ id: 'KETO', name: 'Keto' },
	{ id: 'MEDITERRANEAN', name: 'Mediterránea' },
	{ id: 'FRESH', name: 'Fresca' },
	{ id: 'LOCAL', name: 'Local' },
	{ id: 'ORGANIC', name: 'Organica' },
	{ id: 'BIO', name: 'Bio' }
];

export type MealAdditional = (typeof MEAL_ADDITIONAL_OPTIONS)[number]['id'];
export const MEAL_ADDITIONAL_VALUES = MEAL_ADDITIONAL_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];

export const MEAL_ALLERGEN_OPTIONS = [
	{ id: 'CELERY', name: 'Apio' },
	{ id: 'CRUSTACEANS', name: 'Crustáceos' },
	{ id: 'EGGS', name: 'Huevo' },
	{ id: 'FISH', name: 'Pescado' },
	{ id: 'GLUTEN', name: 'Gluten' },
	{ id: 'LUPIN', name: 'Altramuces' },
	{ id: 'MILK', name: 'Leche' },
	{ id: 'MOLLUSCS', name: 'Moluscos' },
	{ id: 'MUSTARD', name: 'Mostaza' },
	{ id: 'NUTS', name: 'Frutos secos' },
	{ id: 'PEANUTS', name: 'Almendras' },
	{ id: 'SESAME', name: 'Sésamo' },
	{ id: 'SOY', name: 'Soja' },
	{ id: 'SULPHITES', name: 'Sulfitos' }
];

export type MealAllergen = (typeof MEAL_ALLERGEN_OPTIONS)[number]['id'];
export const MEAL_ALLERGEN_VALUES = MEAL_ALLERGEN_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];
