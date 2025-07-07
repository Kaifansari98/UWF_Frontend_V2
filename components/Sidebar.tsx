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
  { label: "Pending Forms", icon: Clock },
  { label: "Submitted Forms", icon: FileCheck },
  { label: "Rejected Forms", icon: Ban },
  { label: "Accepted Forms", icon: CheckCircle },
  { label: "In Progress Requests", icon: DollarSign },
  { label: "Disbursed Forms", icon: DollarSign },
  { label: "Closed Forms", icon: XCircle },
];

const acknowledgementItems = [
  "Generate Acknowledgement",
  "Pending Acknowledgement",
  "Submitted Acknowledgement",
  "Accepted Acknowledgement",
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
          const route = path === "dashboard" ? "/dashboard" : `/dashboard/${path}`;
          router.push(route);
        }}
        className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium ${
          isActive ? "bg-[#025aa5] text-white" : "text-gray-700 hover:bg-gray-100"
        } transition-all`}
      >
        <Icon size={18} />
        <span>{label}</span>
      </button>
    </li>
  );
})}

{/* Aid Acknowledgement Dropdown */}
<li>
  <details className="group">
    <summary className="flex items-center justify-between px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer">
      <span className="flex items-center gap-3">
        <FilePlus size={18} />
        Aid Acknowledgement
      </span>
      <span className="group-open:rotate-90 transition-transform">▶</span>
    </summary>
    <ul className="ml-6 mt-1 space-y-1">
      {acknowledgementItems.map((item) => {
        const path = item.toLowerCase().replace(/\s+/g, "-");
        return (
          <li key={item}>
            <button
              onClick={() => router.push(`/dashboard/${path}`)}
              className={`w-full text-left px-3 py-1.5 rounded-md text-sm ${
                pathname === `/dashboard/${path}` ? "bg-[#025aa5] text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          </li>
        );
      })}
    </ul>
  </details>
</li>

          </ul>
        </nav>
      </div>

      <div className="p-4 border-t">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-start px-4 gap-4 bg-[#025aa5] text-white py-2 rounded-md text-sm font-semibold transition"
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
