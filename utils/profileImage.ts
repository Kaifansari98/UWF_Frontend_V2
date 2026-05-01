import { APP_URL } from "./runtimeConfig";

export const getProfileImageSrc = (profilePic?: string | null, fallback = "/avatar.jpg") => {
  if (!profilePic) return fallback;

  if (profilePic.startsWith("http://localhost") || profilePic.startsWith("https://localhost")) {
    try {
      const url = new URL(profilePic);
      return `${APP_URL}${url.pathname}`;
    } catch {
      return profilePic;
    }
  }

  return profilePic.replace(/^http:\/\//i, "https://");
};
