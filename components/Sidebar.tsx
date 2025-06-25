"use client";

import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { RootState } from "@/lib/store";
import { logout } from "@/features/auth/authSlice";
import Image from "next/image";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  FilePlus,
  FileCheck,
  Clock,
  Ban,
  CheckCircle,
  DollarSign,
  XCircle,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import ConfirmModal from "./ConfirmModal";

type SidebarProps = {
  active: string;
  onSelect: (tab: string) => void;
};

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Create User", icon: UserPlus },
  { label: "Users List", icon: Users },
  { label: "Form Generation", icon: FilePlus },
  { label: "Submitted Forms", icon: FileCheck },
  { label: "Pending Forms", icon: Clock },
  { label: "Rejected Forms", icon: Ban },
  { label: "Accepted Forms", icon: CheckCircle },
  { label: "Disbursed Forms", icon: DollarSign },
  { label: "Closed Forms", icon: XCircle },
];

export default function Sidebar({ active, onSelect }: SidebarProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter(); 
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    window.location.href = "/";
  };

  return (
    <aside className="w-[280px] h-screen bg-white border-r shadow-md flex flex-col justify-between fixed left-0 top-0 z-50">
      <div className="py-6 px-4 space-y-6 overflow-y-auto">
        {user && (
          <div className="flex flex-col items-center text-center mt-4 pb-5 border-b-[0.5px] border-b">
            <div className="relative w-20 h-20">
            <img
              src={user.profile_pic || "/avatar.jpg"}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border border-gray-200"
            />
            </div>
            <p className="mt-2 font-semibold text-gray-800">
              {user.full_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        )}

        <nav className="mt-2">
          <ul className="space-y-1">
          {navItems.map(({ label, icon: Icon }) => {
  const path = label.toLowerCase().replace(/\s+/g, "-");
  const isActive =
    path === "dashboard"
      ? pathname === "/dashboard"
      : pathname === `/dashboard/${path}`;

  return (
    <li key={label}>
      <button
  onClick={() => {
    const path = label.toLowerCase().replace(/\s+/g, "-");
    const route = path === "dashboard" ? "/dashboard" : `/dashboard/${path}`;
    router.push(route);
  }}
  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium ${
    isActive
      ? "bg-[#292929] text-white"
      : "text-gray-700 hover:bg-gray-100"
  } transition-all`}
>
  <Icon size={18} />
  <span>{label}</span>
</button>

    </li>
  );
})}

          </ul>
        </nav>
      </div>

      <div className="p-4 border-t">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-start px-4 gap-4 bg-[#292929] text-white py-2 rounded-md text-sm font-semibold transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {showLogoutConfirm && (
        <ConfirmModal
          title="Confirm Logout"
          description="Are you sure you want to logout?"
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogoutConfirm}
        />
      )}
    </aside>
  );
}
