// layouts/app-layout.tsx

import { CompactNavbarForJudge } from "@/components/shared/CompactNavbarForJudge";
import { Outlet } from "react-router-dom";


export default function ProblemLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <CompactNavbarForJudge />
      <main>
        <Outlet />
      </main>
    </div>
  );
}