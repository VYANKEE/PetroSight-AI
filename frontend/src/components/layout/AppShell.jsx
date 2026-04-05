import { Outlet } from "react-router-dom";

import AnimatedBackdrop from "./AnimatedBackdrop";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell() {
  return (
    <div className="page-shell bg-aurora px-4 py-4 sm:px-6">
      <AnimatedBackdrop />
      <div className="relative mx-auto flex max-w-[1600px] gap-6">
        <Sidebar />
        <main className="relative flex-1 space-y-6">
          <Topbar />
          <div className="app-scroll pr-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
