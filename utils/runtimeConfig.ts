const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const APP_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
);

export const API_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
);

export const ASSET_BASE_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_ASSET_BASE_URL || "http://localhost:5001/assets"
);
