export const RESOURCE_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video'
} as const;

export type ResourceType = typeof RESOURCE_TYPES.IMAGE | typeof RESOURCE_TYPES.VIDEO;

export const RESOURCE_PROPS = {
  SECURE_URL: 'secure_url',
  PUBLIC_ID: 'public_id'
} as const;