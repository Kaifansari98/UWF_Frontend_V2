"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useState } from "react";
import { RootState } from "@/lib/store";
import { logout } from "@/features/auth/authSlice";
import ConfirmModal from "./ConfirmModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { getProfileImageSrc } from "@/utils/profileImage";
import {
  Sidebar as AppSidebarShell,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronsUpDown,
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
  KeyRound,
  MoreVertical,
  FileSignature,
} from "lucide-react";

type SidebarProps = {
  active?: string;
  onSelect?: (tab: string) => void;
};

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Users List", icon: Users },
  // { label: "Form Generation", icon: FilePlus },
  { label: "Pending Requests", icon: Clock },
  { label: "Request Rejected", icon: Ban },
  { label: "Request Evaluation", icon: FileCheck },
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
  super_admin: [...navItems.map((item) => item.label), "Acknowledgement"],
  admin: [...navItems.map((item) => item.label), "Acknowledgement"],
  form_creator: ["Form Generation", "Pending Requests", "Request Rejected"],
  evaluator: ["Request Evaluation", "Pending Requests", "Request Rejected"],
  treasurer: ["Treasury Review", "Treasury Approval"],
  approver: ["Approved Cases"],
  disbursement_approver: ["Aid Disbursement", "Acknowledgement"],
  case_closure: ["Closed Cases"],
};

function getPathFromLabel(label: string) {
  const path = label.toLowerCase().replace(/\s+/g, "-");
  return path === "dashboard" ? "/dashboard" : `/dashboard/${path}`;
}

export default function Sidebar(_props: SidebarProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const allowedTabs = useMemo(
    () => roleTabsMap[user?.role] || [],
    [user?.role],
  );

  const primaryItems = navItems.filter(
    ({ label }) =>
      label !== "Closed Cases" &&
      (label === "Dashboard" || allowedTabs.includes(label)),
  );

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    window.location.href = "/";
  };

  return (
    <>
      <AppSidebarShell collapsible="icon" variant="inset">
        <SidebarHeader className="gap-4 py-2">
          {user && (
            <div className="flex items-center justify-between gap-3 overflow-hidden rounded-xl">
              <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sidebar-border text-sm font-bold bg-blue-500 text-white">
                  UWF
                </div>
                <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                  <p className="truncate text-sm font-semibold text-sidebar-foreground">
                    Student Aid Portal
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/70">
                    {roleDisplayMap[user.role] || user.role}
                  </p>
                </div>
              </div>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <div className="flex h-fit w-fit items-center justify-center">
                  <ChevronsUpDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent className="px-0 py-4">
          <SidebarGroup>
            <SidebarGroupLabel>CRM Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {primaryItems.map(({ label, icon: Icon }) => {
                  const href = getPathFromLabel(label);
                  const isActive = pathname === href;
                  return (
                    <SidebarMenuItem key={label}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={label}
                        className="h-10 data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-500 [&[data-active=true]_svg]:text-blue-500"
                      >
                        <Link href={href}>
                          <Icon />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {allowedTabs.includes("Acknowledgement") && (
            <SidebarGroup>
              <SidebarGroupLabel>Acknowledgement</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Acknowledgement">
                      <FileSignature />
                      <span>Acknowledgement</span>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      {acknowledgementItems.map((item) => {
                        const href = getPathFromLabel(item);
                        return (
                          <SidebarMenuSubItem key={item}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === href}
                              className="data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-500 [&[data-active=true]_svg]:text-blue-500"
                            >
                              <Link href={href}>
                                <span>{item}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {allowedTabs.includes("Closed Cases") && (
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems
                    .filter(({ label }) => label === "Closed Cases")
                    .map(({ label, icon: Icon }) => {
                      const href = getPathFromLabel(label);
                      return (
                        <SidebarMenuItem key={label}>
                          <SidebarMenuButton
                            asChild
                            isActive={pathname === href}
                            tooltip={label}
                            className="h-10 data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-500 [&[data-active=true]_svg]:text-blue-500"
                          >
                            <Link href={href}>
                              <Icon />
                              <span>{label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="py-3 px-1">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 text-left">
                  <img
                    src={getProfileImageSrc(user.profile_pic, "/avatar.jpg")}
                    alt={`${user.full_name} profile`}
                    className="h-10 w-10 rounded-full border object-cover shadow-sm"
                  />
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <p className="truncate text-sm font-semibold text-sidebar-foreground">
                      {user.full_name}
                    </p>
                    <p className="truncate text-xs text-sidebar-foreground/70">
                      {user.email}
                    </p>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                    <MoreVertical size={16} />
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="right"
                sideOffset={12}
                className="w-64 rounded-xl p-2"
              >
                <DropdownMenuItem
                  onClick={() => setShowChangePassword(true)}
                  className="rounded-lg px-3 py-2.5"
                >
                  <KeyRound size={16} />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowLogoutConfirm(true)}
                  className="rounded-lg bg-red-600 px-3 py-2.5 text-white focus:bg-red-500 focus:text-white"
                >
                  <LogOut size={16} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarFooter>
        <SidebarRail />
      </AppSidebarShell>

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
    </>
  );
}
