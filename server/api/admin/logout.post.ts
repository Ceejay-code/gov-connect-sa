import { clearAdminSessionCookie } from "~/server/utils/admin-auth";

export default defineEventHandler((event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  clearAdminSessionCookie(event);
  return { authenticated: false };
});
