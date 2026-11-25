import {
  assertLoginAllowed,
  clearFailedLogins,
  getAdminPassword,
  recordFailedLogin,
  setAdminSessionCookie,
  verifyPasswordConstantTime,
} from "~/server/utils/admin-auth";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  assertLoginAllowed(event);

  const expectedPassword = getAdminPassword();
  const body = await readBody<{ password?: unknown }>(event).catch(() => null);
  const providedPassword = typeof body?.password === "string" ? body.password : "";

  if (!verifyPasswordConstantTime(providedPassword, expectedPassword)) {
    recordFailedLogin(event);
    throw createError({
      statusCode: 401,
      statusMessage: "Incorrect password.",
    });
  }

  clearFailedLogins(event);
  setAdminSessionCookie(event);

  return { authenticated: true };
});
