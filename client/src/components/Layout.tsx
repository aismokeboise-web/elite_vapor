import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { WarningBanner } from "./WarningBanner";
import { AgeGate } from "./AgeGate";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <AgeGate />
      <WarningBanner />
      <Navbar />
      <main className="flex-1 bg-slate-100">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
