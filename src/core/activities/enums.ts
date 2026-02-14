/**
 * Enums de dominio de actividades
 * Espejo del backend — sin dependencias de UI ni traducciones
 */

export enum ActivityStatus {
	APPROVED = 'APPROVED',
	DELETED = 'DELETED',
	DRAFT = 'DRAFT',
	PENDING_REVIEW = 'PENDING_REVIEW',
	PUBLISHED = 'PUBLISHED',
	REJECTED = 'REJECTED',
	UNPUBLISHED = 'UNPUBLISHED'
}

export enum ActivityKind {
	PAID_TOUR = 'PAID_TOUR',
	FREE_TOUR = 'FREE_TOUR',
	OTHER = 'OTHER'
}

export enum ActivityGuideKind {
	AUTO = 'AUTO',
	CUSTOM_LANGUAGE = 'CUSTOM_LANGUAGE',
	DRIVER = 'DRIVER',
	GUEST = 'GUEST',
	INSTRUCTOR = 'INSTRUCTOR'
}

export enum ActivityNotSuitableFor {
	ADULTS = 'ADULTS',
	CHILDREN = 'CHILDREN',
	FAMILIES = 'FAMILIES',
	GROUPS = 'GROUPS',
	INDIVIDUALS = 'INDIVIDUALS'
}

export enum ActivityRestriction {
	ALCOHOL = 'ALCOHOL',
	SMOKING = 'SMOKING',
	PETS = 'PETS',
	OTHER = 'OTHER'
}

export enum ActivityAllergen {
	CELERY = 'CELERY',
	CRUSTACEANS = 'CRUSTACEANS',
	EGGS = 'EGGS',
	FISH = 'FISH',
	GLUTEN = 'GLUTEN',
	LUPIN = 'LUPIN',
	MILK = 'MILK',
	MOLLUSCS = 'MOLLUSCS',
	MUSTARD = 'MUSTARD',
	NUTS = 'NUTS',
	PEANUTS = 'PEANUTS',
	SESAME = 'SESAME',
	SOY = 'SOY',
	SULPHITES = 'SULPHITES'
}

export enum ActivityTransportKind {
	BUS = 'BUS',
	CAR = 'CAR',
	TRAIN = 'TRAIN',
	PLANE = 'PLANE',
	BOAT = 'BOAT',
	BIKE = 'BIKE',
	OTHER = 'OTHER',
	NONE = 'NONE'
}

export enum ActivityTransportLocation {
	SAME_PLACE = 'SAME_PLACE',
	DIFFERENT_PLACE = 'DIFFERENT_PLACE'
}

export enum ActivityPetsAllowed {
	YES = 'YES',
	NO = 'NO',
	NOT_APPLY = 'NOT_APPLY'
}

export enum MultimediaKind {
	IMAGE = 'IMAGE',
	VIDEO = 'VIDEO'
}

// Stages

export enum StageKind {
	TRANSFER = 'TRANSFER',
	EXPERIENCE = 'EXPERIENCE'
}

export enum StageRelevance {
	HIGH = 'HIGH',
	MEDIUM = 'MEDIUM',
	LOW = 'LOW',
	NONE = 'NONE'
}

export enum StageRequirement {
	OPTIONAL = 'OPTIONAL',
	REQUIRED = 'REQUIRED',
	SUGGESTED = 'SUGGESTED',
	NONE = 'NONE'
}

// Meals

export enum MealFormat {
	BARBECUE = 'BARBECUE',
	BUFFET = 'BUFFET',
	COMPLETE = 'COMPLETE',
	COURSE = 'COURSE',
	PICNIC = 'PICNIC',
	SNACK = 'SNACK',
	TAKE_AWAY = 'TAKE_AWAY',
	TASTING = 'TASTING'
}

export enum MealKind {
	BREAKFAST = 'BREAKFAST',
	BRUNCH = 'BRUNCH',
	DEPEND_ON_HOUR = 'PENDING_HOUR',
	DINNER = 'DINNER',
	LUNCH = 'LUNCH',
	OTHER = 'OTHER'
}

export enum MealAdditional {
	VEGETARIAN = 'VEGETARIAN',
	VEGAN = 'VEGAN',
	GLUTEN_FREE = 'GLUTEN_FREE',
	LACTOSE_FREE = 'LACTOSE_FREE',
	NUT_FREE = 'NUT_FREE',
	SOY_FREE = 'SOY_FREE',
	MUSHROOM_FREE = 'MUSHROOM_FREE',
	SEAFOOD_FREE = 'SEAFOOD_FREE',
	SHELLFISH_FREE = 'SHELLFISH_FREE',
	EGG_FREE = 'EGG_FREE',
	PALEO = 'PALEO',
	KETO = 'KETO',
	MEDITERRANEAN = 'MEDITERRANEAN',
	FRESH = 'FRESH',
	LOCAL = 'LOCAL',
	ORGANIC = 'ORGANIC',
	BIO = 'BIO'
}
