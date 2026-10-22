import type { ReactNode } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";


export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (

    <div className="dashboard-layout">
      <Header />
      <Sidebar />

        <main className="menu">{children}</main>
    </div>
  );
}