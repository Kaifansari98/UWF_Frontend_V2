"use client";

import Sidebar from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar />
      <SidebarInset className="min-h-screen bg-white">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
