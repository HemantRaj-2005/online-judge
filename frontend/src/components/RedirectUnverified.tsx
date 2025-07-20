// src/components/RedirectUnverified.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/redux/hook";

const EXEMPT_ROUTES = ["/sign-in", "/sign-up", "/resend-verification"];

export default function RedirectUnverified({ children }: { children: React.ReactNode }) {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && !user.isVerified) {
      const currentPath = location.pathname;
      const isExempt = EXEMPT_ROUTES.includes(currentPath);
      if (!isExempt) {
        navigate("/resend-verification", { replace: true });
      }
    }
  }, [user, location.pathname]);

  return <>{children}</>;
}
