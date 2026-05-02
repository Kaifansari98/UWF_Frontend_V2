"use client";

import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { RootState } from "@/lib/store";
import { logout } from "@/features/auth/authSlice";
import {
  LayoutDashboard,
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
  MoreVertical,
  KeyRound,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import ConfirmModal from "./ConfirmModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { getProfileImageSrc } from "@/utils/profileImage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SidebarProps = {
  active: string;
  onSelect: (tab: string) => void;
};

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  // { label: "Create User", icon: UserPlus },
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

const roleTabsMap: Record<string, string[]> = {
  super_admin: [...navItems.map(item => item.label), "Acknowledgement"],
  admin: [...navItems.map(item => item.label), "Acknowledgement"],
  form_creator: ["Form Generation", "Pending Requests", "Request Rejected"],
  evaluator: ["Request Evaluation", "Pending Requests", "Request Rejected"],
  treasurer: ["Treasury Review", "Treasury Approval"],
  approver: ["Approved Cases"],
  disbursement_approver: ["Aid Disbursement", "Acknowledgement"],
  case_closure: ["Closed Cases"],
};

export default function Sidebar({ active, onSelect }: SidebarProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
 
  const allowedTabs = roleTabsMap[user?.role] || [];

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    window.location.href = "/";
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col justify-between border-r-[1px] border-zinc-200 border-gray-100 bg-gradient-to-b from-gray-50 to-white transition-all duration-300">
      <div className="space-y-8 px-5 py-8">
        {user && (
          <div className="mt-4 flex flex-col items-center border-b border-gray-200 pb-6 text-center">
            <div className="group relative h-24 w-24">
              <img
                src={getProfileImageSrc(user.profile_pic, "/avatar.jpg")}
                alt="Profile"
                className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </div>
            <p className="mt-3 text-lg font-bold tracking-tight text-gray-900">
              {user.full_name}
            </p>
            <p className="mt-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500">
              {roleDisplayMap[user.role] || user.role}
            </p>
          </div>
        )}

        <nav className="mt-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <ul className="space-y-2 pb-20">
            {navItems.slice(0, -1).filter(({ label }) => label === "Dashboard" || allowedTabs.includes(label)).map(({ label, icon: Icon }) => {
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

            {allowedTabs.includes("Acknowledgement") && (
              <li>
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-blue-600">
                    <span className="flex items-center gap-3">
                      <FilePlus size={20} className="text-gray-500" />
                      Acknowledgement
                    </span>
                    <span className="text-gray-400 transition-transform duration-200 group-open:rotate-90"><ChevronRight size={16} /></span>
                  </summary>
                  <ul className="ml-8 mt-2 space-y-1.5">
                    {acknowledgementItems.map((item) => {
                      const path = item.toLowerCase().replace(/\s+/g, "-");
                      return (
                        <li key={item}>
                          <button
                            onClick={() => router.push(`/dashboard/${path}`)}
                            className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium ${
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
            )}

            {allowedTabs.includes("Closed Cases") && (() => {
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

      <div className="absolute bottom-0 w-full border-t border-gray-200 bg-white px-3 py-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-2xl text-left transition-all duration-200">
                <img
                  src={getProfileImageSrc(user.profile_pic, "/avatar.jpg")}
                  alt={`${user.full_name} profile`}
                  className="h-11 w-11 rounded-full border border-white object-cover shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {user.full_name}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{user.email}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white hover:text-zinc-800">
                  <MoreVertical size={18} />
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="right"
              sideOffset={12}
              className="w-72 overflow-hidden rounded-2xl p-0"
            >
              <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-4">
                <img
                  src={getProfileImageSrc(user.profile_pic, "/avatar.jpg")}
                  alt={`${user.full_name} profile`}
                  className="h-12 w-12 rounded-full border border-white object-cover shadow-sm"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {user.full_name}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator className="my-0" />
              <div className="p-2 space-y-1">
                <DropdownMenuItem
                  onClick={() => setShowChangePassword(true)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  <KeyRound size={16} className="text-zinc-500" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowLogoutConfirm(true)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium bg-red-600 text-white hover:bg-red-500"
                >
                  <LogOut size={16} color="white"/>
                  Log out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {showLogoutConfirm && (
        <ConfirmModal
          title="Confirm Logout"
          description="Are you sure you want to logout?"
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogoutConfirm}
        />
      )}

      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </aside>
  );
}
