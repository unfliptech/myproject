export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  vite: {
    build: {
      rollupOptions: {
        external: ["axios"],
      },
    },
  },
});
