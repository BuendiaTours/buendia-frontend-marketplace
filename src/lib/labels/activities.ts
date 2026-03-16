/**
 * UI labels for activity enums.
 * Translations of domain enums for dropdowns, selects, checkboxes, etc.
 */

import {
	ActivityStatus,
	ActivityKind,
	ActivityGuideKind,
	ActivityDateMode,
	ActivityNotSuitableFor,
	ActivityRestriction,
	ActivityAllergen,
	ActivityTransportKind,
	ActivityTransportLocation,
	ActivityPetsAllowed,
	StageKind,
	StageRequirement,
	StageRelevance,
	MealFormat,
	MealKind,
	MealAdditional
} from '$core/activities/enums';
import * as m from '$paraglide/messages';

export const ACTIVITY_STATUS_OPTIONS = [
	{ id: ActivityStatus.APPROVED, name: m.enum_activityStatus_approved() },
	{ id: ActivityStatus.DELETED, name: m.enum_activityStatus_deleted() },
	{ id: ActivityStatus.DRAFT, name: m.enum_activityStatus_draft() },
	{ id: ActivityStatus.PENDING_REVIEW, name: m.enum_activityStatus_pendingReview() },
	{ id: ActivityStatus.PUBLISHED, name: m.enum_activityStatus_published() },
	{ id: ActivityStatus.REJECTED, name: m.enum_activityStatus_rejected() },
	{ id: ActivityStatus.UNPUBLISHED, name: m.enum_activityStatus_unpublished() }
];

export const ACTIVITY_KIND_OPTIONS = [
	{ id: ActivityKind.PAID_TOUR, name: m.enum_activityKind_paidTour() },
	{ id: ActivityKind.FREE_TOUR, name: m.enum_activityKind_freeTour() },
	{ id: ActivityKind.OTHER, name: m.enum_activityKind_other() }
];

export const ACTIVITY_GUIDE_KIND_OPTIONS = [
	{ id: ActivityGuideKind.AUTO, name: m.enum_activityGuideKind_auto() },
	{ id: ActivityGuideKind.CUSTOM_LANGUAGE, name: m.enum_activityGuideKind_customLanguage() },
	{ id: ActivityGuideKind.DRIVER, name: m.enum_activityGuideKind_driver() },
	{ id: ActivityGuideKind.GUEST, name: m.enum_activityGuideKind_guest() },
	{ id: ActivityGuideKind.INSTRUCTOR, name: m.enum_activityGuideKind_instructor() }
];

export const ACTIVITY_DATE_MODE_OPTIONS = [
	{ id: ActivityDateMode.DATE_AND_TIME, name: m.enum_activityDateMode_dateAndTime() },
	{ id: ActivityDateMode.DATE, name: m.enum_activityDateMode_date() }
];

export const ACTIVITY_TRANSPORT_KIND_OPTIONS = [
	{ id: ActivityTransportKind.BUS, name: m.enum_activityTransportKind_bus() },
	{ id: ActivityTransportKind.CAR, name: m.enum_activityTransportKind_car() },
	{ id: ActivityTransportKind.TRAIN, name: m.enum_activityTransportKind_train() },
	{ id: ActivityTransportKind.PLANE, name: m.enum_activityTransportKind_plane() },
	{ id: ActivityTransportKind.BOAT, name: m.enum_activityTransportKind_boat() },
	{ id: ActivityTransportKind.BIKE, name: m.enum_activityTransportKind_bike() },
	{ id: ActivityTransportKind.OTHER, name: m.enum_activityTransportKind_other() },
	{ id: ActivityTransportKind.NONE, name: m.enum_activityTransportKind_none() }
];

export const ACTIVITY_TRANSPORT_LOCATION_OPTIONS = [
	{
		id: ActivityTransportLocation.SAME_PLACE,
		name: m.enum_activityTransportLocation_samePlace()
	},
	{
		id: ActivityTransportLocation.DIFFERENT_PLACE,
		name: m.enum_activityTransportLocation_differentPlace()
	}
];

export const ACTIVITY_PETS_ALLOWED_OPTIONS = [
	{ id: ActivityPetsAllowed.YES, name: m.enum_activityPetsAllowed_yes() },
	{ id: ActivityPetsAllowed.NO, name: m.enum_activityPetsAllowed_no() },
	{ id: ActivityPetsAllowed.NOT_APPLY, name: m.enum_activityPetsAllowed_notApply() }
];

export const ACTIVITY_NOT_SUITABLE_FOR_OPTIONS = [
	{ id: ActivityNotSuitableFor.ADULTS, name: m.enum_activityNotSuitableFor_adults() },
	{ id: ActivityNotSuitableFor.CHILDREN, name: m.enum_activityNotSuitableFor_children() },
	{ id: ActivityNotSuitableFor.FAMILIES, name: m.enum_activityNotSuitableFor_families() },
	{ id: ActivityNotSuitableFor.GROUPS, name: m.enum_activityNotSuitableFor_groups() },
	{ id: ActivityNotSuitableFor.INDIVIDUALS, name: m.enum_activityNotSuitableFor_individuals() }
];

export const ACTIVITY_RESTRICTION_OPTIONS = [
	{ id: ActivityRestriction.ALCOHOL, name: m.enum_activityRestriction_alcohol() },
	{ id: ActivityRestriction.SMOKING, name: m.enum_activityRestriction_smoking() },
	{ id: ActivityRestriction.PETS, name: m.enum_activityRestriction_pets() },
	{ id: ActivityRestriction.OTHER, name: m.enum_activityRestriction_other() }
];

// Stages

export const STAGE_KIND_OPTIONS = [
	{
		id: StageKind.TRANSFER,
		name: m.enum_stageKind_transfer_name(),
		description: m.enum_stageKind_transfer_description()
	},
	{
		id: StageKind.EXPERIENCE,
		name: m.enum_stageKind_experience_name(),
		description: m.enum_stageKind_experience_description()
	}
];

export const STAGE_REQUIREMENT_OPTIONS = [
	{ id: StageRequirement.OPTIONAL, name: m.enum_stageRequirement_optional() },
	{ id: StageRequirement.REQUIRED, name: m.enum_stageRequirement_required() },
	{ id: StageRequirement.SUGGESTED, name: m.enum_stageRequirement_suggested() },
	{ id: StageRequirement.NONE, name: m.enum_stageRequirement_none() }
];

export const STAGE_RELEVANCE_OPTIONS = [
	{ id: StageRelevance.HIGH, name: m.enum_stageRelevance_high() },
	{ id: StageRelevance.MEDIUM, name: m.enum_stageRelevance_medium() },
	{ id: StageRelevance.LOW, name: m.enum_stageRelevance_low() },
	{ id: StageRelevance.NONE, name: m.enum_stageRelevance_none() }
];

// Meals

export const MEAL_FORMAT_OPTIONS = [
	{ id: MealFormat.BARBECUE, name: m.enum_mealFormat_barbecue() },
	{ id: MealFormat.BUFFET, name: m.enum_mealFormat_buffet() },
	{ id: MealFormat.COMPLETE, name: m.enum_mealFormat_complete() },
	{ id: MealFormat.COURSE, name: m.enum_mealFormat_course() },
	{ id: MealFormat.PICNIC, name: m.enum_mealFormat_picnic() },
	{ id: MealFormat.SNACK, name: m.enum_mealFormat_snack() },
	{ id: MealFormat.TAKE_AWAY, name: m.enum_mealFormat_takeAway() },
	{ id: MealFormat.TASTING, name: m.enum_mealFormat_tasting() }
];

export const MEAL_KIND_OPTIONS = [
	{ id: MealKind.BREAKFAST, name: m.enum_mealKind_breakfast() },
	{ id: MealKind.BRUNCH, name: m.enum_mealKind_brunch() },
	{ id: MealKind.DEPEND_ON_HOUR, name: m.enum_mealKind_dependOnHour() },
	{ id: MealKind.DINNER, name: m.enum_mealKind_dinner() },
	{ id: MealKind.LUNCH, name: m.enum_mealKind_lunch() },
	{ id: MealKind.OTHER, name: m.enum_mealKind_other() }
];

export const MEAL_ADDITIONAL_OPTIONS = [
	{ id: MealAdditional.VEGETARIAN, name: m.enum_mealAdditional_vegetarian() },
	{ id: MealAdditional.VEGAN, name: m.enum_mealAdditional_vegan() },
	{ id: MealAdditional.GLUTEN_FREE, name: m.enum_mealAdditional_glutenFree() },
	{ id: MealAdditional.LACTOSE_FREE, name: m.enum_mealAdditional_lactoseFree() },
	{ id: MealAdditional.NUT_FREE, name: m.enum_mealAdditional_nutFree() },
	{ id: MealAdditional.SOY_FREE, name: m.enum_mealAdditional_soyFree() },
	{ id: MealAdditional.MUSHROOM_FREE, name: m.enum_mealAdditional_mushroomFree() },
	{ id: MealAdditional.SEAFOOD_FREE, name: m.enum_mealAdditional_seafoodFree() },
	{ id: MealAdditional.SHELLFISH_FREE, name: m.enum_mealAdditional_shellfishFree() },
	{ id: MealAdditional.EGG_FREE, name: m.enum_mealAdditional_eggFree() },
	{ id: MealAdditional.PALEO, name: m.enum_mealAdditional_paleo() },
	{ id: MealAdditional.KETO, name: m.enum_mealAdditional_keto() },
	{ id: MealAdditional.MEDITERRANEAN, name: m.enum_mealAdditional_mediterranean() },
	{ id: MealAdditional.FRESH, name: m.enum_mealAdditional_fresh() },
	{ id: MealAdditional.LOCAL, name: m.enum_mealAdditional_local() },
	{ id: MealAdditional.ORGANIC, name: m.enum_mealAdditional_organic() },
	{ id: MealAdditional.BIO, name: m.enum_mealAdditional_bio() }
];

export const ACTIVITY_ALLERGEN_OPTIONS = [
	{ id: ActivityAllergen.CELERY, name: m.enum_activityAllergen_celery() },
	{ id: ActivityAllergen.CRUSTACEANS, name: m.enum_activityAllergen_crustaceans() },
	{ id: ActivityAllergen.EGGS, name: m.enum_activityAllergen_eggs() },
	{ id: ActivityAllergen.FISH, name: m.enum_activityAllergen_fish() },
	{ id: ActivityAllergen.GLUTEN, name: m.enum_activityAllergen_gluten() },
	{ id: ActivityAllergen.LUPIN, name: m.enum_activityAllergen_lupin() },
	{ id: ActivityAllergen.MILK, name: m.enum_activityAllergen_milk() },
	{ id: ActivityAllergen.MOLLUSCS, name: m.enum_activityAllergen_molluscs() },
	{ id: ActivityAllergen.MUSTARD, name: m.enum_activityAllergen_mustard() },
	{ id: ActivityAllergen.NUTS, name: m.enum_activityAllergen_nuts() },
	{ id: ActivityAllergen.PEANUTS, name: m.enum_activityAllergen_peanuts() },
	{ id: ActivityAllergen.SESAME, name: m.enum_activityAllergen_sesame() },
	{ id: ActivityAllergen.SOY, name: m.enum_activityAllergen_soy() },
	{ id: ActivityAllergen.SULPHITES, name: m.enum_activityAllergen_sulphites() }
];
