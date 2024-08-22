import { useUserStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore();

  try {
    // Perform an auth check (the server-side will use the HTTP-only access token)
    await userStore.checkAuth();

    // If the user is authenticated, proceed to the requested secure page
    if (userStore.isLoggedIn) {
      return;
    }

    // If the checkAuth fails (meaning the user is not authenticated), try refreshing the token
    const refreshTokenSuccess = await userStore.refreshToken();

    if (!refreshTokenSuccess) {
      // If refreshing the token fails, clear the state and redirect to the auth/phone page
      userStore.resetState();
      return navigateTo("/auth/phone");
    }

    // After refreshing, perform the auth check again
    await userStore.checkAuth();

    if (!userStore.isLoggedIn) {
      // If the user is still not authenticated, clear the state and redirect to the auth/phone page
      userStore.resetState();
      return navigateTo("/auth/phone");
    }
  } catch (error) {
    console.error("Error during auth middleware processing:", error);
    // On any unexpected error, clear the state and redirect to the auth/phone page
    userStore.resetState();
    return navigateTo("/auth/phone");
  }
});
