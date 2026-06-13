import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { logout } from "@/redux/user/authSlice";
import { refreshAccessToken } from "@/services/auth";

export function useSilentRefresh() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => !!state.auth.user);

  useEffect(() => {
    const refresh = async () => {
      const refresh_token = localStorage.getItem("refresh_token");
      if (!refresh_token) return;

      try {
        await refreshAccessToken();
      } catch (error) {
        console.error("Silent token refresh failed:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("refresh_token");
        dispatch(logout());
      }
    };

    // Initial refresh on mount
    if (isLoggedIn) {
      refresh();
    }

    // Interval to refresh every 4 minutes (240000ms)
    const interval = setInterval(() => {
      if (isLoggedIn) {
        refresh();
      }
    }, 240000);

    return () => clearInterval(interval);
  }, [isLoggedIn, dispatch]);
}
