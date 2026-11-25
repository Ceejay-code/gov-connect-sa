import { isAdminAuthenticated } from "~/server/utils/admin-auth";

export default defineEventHandler((event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  return { authenticated: isAdminAuthenticated(event) };
});
