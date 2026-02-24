export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Internal login page — no external OAuth dependency
export const getLoginUrl = (returnPath?: string) => {
  const path = returnPath ? `/login?return=${encodeURIComponent(returnPath)}` : "/login";
  return path;
};
