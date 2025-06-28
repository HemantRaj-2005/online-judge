import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />
        <SidebarTrigger />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
