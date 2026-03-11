export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const CACHE_TTL = {
  TEAM: 300,
  USER: 300,
  PROCESS: 60,
} as const;

export const RATE_LIMITS = {
  AUTH_REQUESTS_PER_MINUTE: 5,
  API_REQUESTS_PER_MINUTE: 100,
} as const;

export const TOKEN_CONFIG = {
  ACCESS_EXPIRY: '15m',
  REFRESH_EXPIRY: '7d',
} as const;
