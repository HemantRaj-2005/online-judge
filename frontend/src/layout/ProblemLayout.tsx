// layouts/app-layout.tsx

import { CompactNavbarForJudge } from "@/components/shared/CompactNavbarForJudge";
import { Outlet } from "react-router-dom";


export default function ProblemLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <CompactNavbarForJudge />
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto w-full max-w-[1800px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}