const resolvedSiteUrl =
  process.env.NUXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss"],

  css: ["~/assets/css/main.css"],

  tailwindcss: {
    cssPath: "~/assets/css/main.css",
    configPath: "tailwind.config.ts",
  },

  components: [
    { path: "~/components/ui", pathPrefix: false },
    { path: "~/components/govconnect", pathPrefix: false },
    { path: "~/components/admin", pathPrefix: false },
    "~/components",
  ],

  nitro: {
    compressPublicAssets: true,
  },

  routeRules: {
    "/**": {
      headers: {
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Frame-Options": "DENY",
      },
    },
    "/": { prerender: true },
    "/sitemap.xml": { prerender: true },
    "/admin": {
      ssr: true,
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "no-store, private",
      },
    },
    "/api/admin/**": {
      headers: {
        "Cache-Control": "no-store, private",
      },
    },
  },

  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      htmlAttrs: { lang: "en-ZA" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "author", content: "CiviLink SA" },
        { name: "theme-color", content: "#0B2E6F" },
        { name: "robots", content: "index, follow" },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap",
        },
        { rel: "icon", href: "/favicon.png", type: "image/png" },
        { rel: "apple-touch-icon", href: "/favicon.png" },
      ],
    },
  },

  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    adminPassword: process.env.ADMIN_PASSWORD || "",
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET || "",
    public: {
      siteUrl: resolvedSiteUrl,
    },
  },
});
