// layouts/app-layout.tsx
import { AppNavbar } from "@/components/shared/navbar";
import { Outlet } from "react-router-dom";


export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar />
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto w-full max-w-[1800px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}