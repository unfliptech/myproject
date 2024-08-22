import axios from "axios";
axios.defaults.withCredentials = true;
export default defineNuxtPlugin((nuxtApp) => {
  const apiClient = axios.create({
    baseURL: "https://lazeezbox.com",
    headers: {
      "Content-Type": "application/json",
      //Hell owrlrd
    },
    withCredentials: true, // Ensure cookies are sent
  });

  nuxtApp.provide("apiClient", apiClient);
});
