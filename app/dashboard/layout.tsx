"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div className="flex">
      <Sidebar active={activeTab} onSelect={setActiveTab} />

      <main className="ml-[280px] w-full p-6 bg-[#f5f5f5] min-h-screen transition-all">
        {children}
      </main>
    </div>
  );
}
