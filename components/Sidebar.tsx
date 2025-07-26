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
  ChevronRight,
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
  { label: "Request Evaluation", icon: FileCheck },
  { label: "Pending Requests", icon: Clock },
  { label: "Request Rejected", icon: Ban },
  { label: "Treasury Review", icon: CheckCircle },
  { label: "Treasury Approval", icon: DollarSign },
  { label: "Approved Cases", icon: DollarSign },
  { label: "Aid Disbursement", icon: DollarSign },
  { label: "Closed Cases", icon: XCircle },
];

const acknowledgementItems = [
  "Pending Form",
  "Submitted Form",
  "Accepted Form",
];

const roleDisplayMap: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  form_creator: "Form Generation",
  evaluator: "Form Evaluation",
  approver: "Form Acceptance",
  disbursement_approver: "Disbursement Approver",
  case_closure: "Case Closure",
  treasurer: "Treasurer",
};

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
    <aside className="w-[280px] h-screen bg-gradient-to-b from-gray-50 to-white border-r-[1px] border-zinc-200 border-gray-100 flex flex-col justify-between fixed left-0 top-0 z-50 transition-all duration-300">
      <div className="py-8 px-5 space-y-8">
        {user && (
          <div className="flex flex-col items-center text-center mt-4 pb-6 border-b border-gray-200">
            <div className="relative w-24 h-24 group">
              <img
                src={
                 user.profile_pic?.includes("localhost")
                 ? user.profile_pic.replace("http://localhost:5000", "https://unitedwelfarefoundation.com")
                 : user.profile_pic || "/avatar.jpg"
                }
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <p className="mt-3 font-bold text-lg text-gray-900 tracking-tight">
              {user.full_name}
            </p>
            <p className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full mt-1">
              {roleDisplayMap[user.role] || user.role}
            </p>
          </div>
        )}

<nav className="mt-4 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-1">
<ul className="space-y-2 pb-20">
  {/* Render all except last navItem */}
  {navItems.slice(0, -1).map(({ label, icon: Icon }) => {
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
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold ${
            isActive
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
              : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
          } transition-all duration-200 transform hover:-translate-y-0.5`}
        >
          <Icon size={20} className={`${isActive ? "text-white" : "text-gray-500"}`} />
          <span>{label}</span>
        </button>
      </li>
    );
  })}

  {/* Aid Acknowledgement Dropdown */}
  <li>
    <details className="group">
      <summary className="flex items-center justify-between px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-blue-600 cursor-pointer transition-all duration-200">
        <span className="flex items-center gap-3">
          <FilePlus size={20} className="text-gray-500" />
          Acknowledgement
        </span>
        <span className="group-open:rotate-90 transition-transform duration-200 text-gray-400"><ChevronRight size={16}/></span>
      </summary>
      <ul className="ml-8 mt-2 space-y-1.5">
        {acknowledgementItems.map((item) => {
          const path = item.toLowerCase().replace(/\s+/g, "-");
          return (
            <li key={item}>
              <button
                onClick={() => router.push(`/dashboard/${path}`)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
                  pathname === `/dashboard/${path}`
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                } transition-all duration-200`}
              >
                {item}
              </button>
            </li>
          );
        })}
      </ul>
    </details>
  </li>

  {/* Render last navItem: Closed Cases */}
  {(() => {
    const { label, icon: Icon } = navItems[navItems.length - 1];
    const path = label.toLowerCase().replace(/\s+/g, "-");
    const isActive = pathname === `/dashboard/${path}`;

    return (
      <li key={label}>
        <button
          onClick={() => router.push(`/dashboard/${path}`)}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold ${
            isActive
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
              : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
          } transition-all duration-200 transform hover:-translate-y-0.5`}
        >
          <Icon size={20} className={`${isActive ? "text-white" : "text-gray-500"}`} />
          <span>{label}</span>
        </button>
      </li>
    );
  })()}
</ul>

        </nav>
      </div>

      <div className="px-5 py-2 border-t border-gray-200 absolute bottom-0 w-full bg-white">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-start px-4 gap-4 bg-gradient-to-r from-red-500 to-red-700 text-white py-3 rounded-lg text-sm font-semibold shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <LogOut size={18} />
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
