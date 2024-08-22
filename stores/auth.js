import { defineStore } from "pinia";
import { useCookie } from "#app";
import authService from "@/services/apis/auth";

export const useUserStore = defineStore("user", {
  state: () => ({
    id: "",
    full_name: "",
    email: "",
    isLoggedIn: false,
    phone: "",
  }),
  actions: {
    async initAuthService() {
      const { $apiClient } = useNuxtApp();
      this.authApi = authService($apiClient);
    },

    setPhone(phone) {
      this.phone = phone;
    },

    async sendOTP() {
      if (!this.authApi) await this.initAuthService();

      try {
        await this.authApi.sendOTP(this.phone);
        return true;
      } catch (error) {
        console.error("Failed to send OTP:", error);
        return false;
      }
    },

    async verifyOTP(otp) {
      if (!this.authApi) await this.initAuthService();

      try {
        const response = await this.authApi.verifyOTP({
          client_id: "7a075a82-8ea4-4db1-aecd-e9b744aa6edd",
          client_secret: "secret-techcorp",
          otp,
          phone: this.phone,
        });

        const { access_token, refresh_token, user } = response.data;

        // Update the store with user information
        this.id = user.id;
        this.full_name = user.name;
        this.email = user.email;

        // Since the access token and refresh token are set by the server as HTTP-only cookies,
        // we only need to update the is_authenticated state.
        const isAuthenticatedCookie = useCookie("is_authenticated");
        isAuthenticatedCookie.value = "true";
        this.isLoggedIn = true;

        return true;
      } catch (error) {
        console.error("OTP verification failed:", error);
        return false;
      }
    },

    async checkAuth() {
      if (!this.authApi) await this.initAuthService();

      try {
        const response = await this.authApi.authCheck();

        if (response.data.status === "authenticated") {
          const isAuthenticatedCookie = useCookie("is_authenticated");
          isAuthenticatedCookie.value = "true";

          this.isLoggedIn = true;
          this.id = response.data.user.id;
          this.full_name = response.data.user.name;
          this.email = response.data.user.email;
        } else {
          this.isLoggedIn = false;
          useCookie("is_authenticated").value = "false";
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        this.isLoggedIn = false;
        useCookie("is_authenticated").value = "false";
      }
    },

    async refreshToken() {
      if (!this.authApi) await this.initAuthService();

      // The refresh_token is stored as an HTTP-only cookie
      // So we don't need to manually retrieve it; the server will handle it.

      try {
        const response = await this.authApi.refreshToken({
          client_id: "7a075a82-8ea4-4db1-aecd-e9b744aa6edd",
          client_secret: "secret-techcorp",
        });

        const { access_token } = response.data;

        // The new access token will be set by the server as an HTTP-only cookie.

        return true;
      } catch (error) {
        console.error(
          "Failed to refresh token:",
          error.response?.data || error
        );
        return false;
      }
    },

    async logout() {
      if (!this.authApi) await this.initAuthService();

      try {
        await this.authApi.logout();

        // Clear the is_authenticated state and reset the store
        useCookie("is_authenticated").value = "false";
        this.resetState();
      } catch (error) {
        console.error("Failed to logout:", error);
      }
    },

    resetState() {
      this.id = "";
      this.full_name = "";
      this.email = "";
      this.isLoggedIn = false;
    },
  },

  persist: true,
});
