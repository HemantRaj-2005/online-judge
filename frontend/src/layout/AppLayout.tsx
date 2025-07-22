// layouts/app-layout.tsx
import { AppNavbar } from "@/components/shared/navbar";
import { Outlet } from "react-router-dom";


export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}