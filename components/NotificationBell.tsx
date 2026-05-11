"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationBell() {
  return (
    <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
      <Bell className="h-4 w-4" />
      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
      <span className="sr-only">Notifications</span>
    </Button>
  );
}
