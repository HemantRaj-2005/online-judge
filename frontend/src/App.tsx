import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import SignUp from "./pages/Auth/SignUp";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/shared/app-sidebar";

export default function App() {
  return (
    <BrowserRouter>
      <SidebarProvider >
        <AppSidebar />
          <SidebarTrigger />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-up" element={<SignUp />} />
        </Routes>
      </SidebarProvider>
    </BrowserRouter>
  );
}
