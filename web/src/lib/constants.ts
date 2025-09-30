export const SKILL_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
  'elite',
] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'legs',
  'core',
  'shoulders',
  'arms',
  'full_body',
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const EQUIPMENT = [
  'pull_up_bar',
  'parallel_bars',
  'rings',
  'floor',
  'wall',
  'bench',
  'none',
] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const AMENITIES = [
  'outdoor',
  'indoor',
  'free',
  'paid',
  'parking',
  'lighting',
  'restrooms',
  'water_fountain',
] as const;
export type Amenity = (typeof AMENITIES)[number];

export const SUBMISSION_STATUS = ['pending', 'approved', 'rejected'] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUS)[number];

export const SUBMISSION_ACTION = ['create', 'update', 'delete'] as const;
export type SubmissionAction = (typeof SUBMISSION_ACTION)[number];

export const ENTITY_TYPE = ['skill', 'place'] as const;
export type EntityType = (typeof ENTITY_TYPE)[number];
