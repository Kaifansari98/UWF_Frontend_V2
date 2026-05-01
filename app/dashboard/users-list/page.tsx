"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchAllUsers, deleteUser, User } from "@/features/users/GetUsersSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditUserModal from "@/components/EditUserModal";
import CreateUserModal from "@/components/CreateUserModal";
import ConfirmModal from "@/components/ConfirmModal";
import { getProfileImageSrc } from "@/utils/profileImage";
import toast from "react-hot-toast";
import {
  Search,
  Pencil,
  Trash2,
  CircleX,
  ShieldCheck,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  UserPlus,
} from "lucide-react";

const PAGE_SIZE_OPTIONS = [20, 30, 40, 50];

type SortDirection = "asc" | "desc" | null;
type SortField = "username" | "full_name" | "email" | "role" | "city" | "mobile_no" | null;

interface ContextMenuState {
  x: number;
  y: number;
  user: User;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  form_creator: "Request Generator",
  evaluator: "Request Evaluator",
  approver: "Request Approver",
  disbursement_approver: "Disbursement Approver",
  case_closure: "Case Closure",
  treasurer: "Treasurer",
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-500",
  admin: "bg-blue-500",
  form_creator: "bg-teal-500",
  evaluator: "bg-orange-400",
  approver: "bg-green-500",
  disbursement_approver: "bg-cyan-500",
  case_closure: "bg-rose-500",
  treasurer: "bg-amber-500",
};

function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: SortField;
  sortField: SortField;
  sortDir: SortDirection;
}) {
  if (sortField !== field)
    return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-muted-foreground/50" />;
  if (sortDir === "asc") return <ChevronUp className="ml-1 inline h-3.5 w-3.5" />;
  return <ChevronDown className="ml-1 inline h-3.5 w-3.5" />;
}

export default function UsersListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.getUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  useEffect(() => {
    if (!contextMenu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeContextMenu(); };
    window.addEventListener("click", closeContextMenu);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("keydown", onKey);
    };
  }, [contextMenu, closeContextMenu]);

  const availableRoles = useMemo(() => {
    const set = new Set(users.map((u) => u.role).filter(Boolean));
    return [...set].sort();
  }, [users]);

  const filtered = useMemo(() => {
    let data = [...users];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.full_name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.city?.toLowerCase().includes(q) ||
          u.mobile_no?.toLowerCase().includes(q)
      );
    }

    if (roleFilter !== "all") {
      data = data.filter((u) => u.role === roleFilter);
    }

    if (sortField && sortDir) {
      data.sort((a, b) => {
        const aVal = String(a[sortField] ?? "");
        const bVal = String(b[sortField] ?? "");
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }

    return data;
  }, [users, search, roleFilter, sortField, sortDir]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const handleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortField(null);
      setSortDir(null);
    }
    setPage(1);
  };

  const handleContextMenu = (e: React.MouseEvent, user: User) => {
    e.preventDefault();
    // Clamp so menu doesn't go off-screen
    const x = Math.min(e.clientX, window.innerWidth - 160);
    const y = Math.min(e.clientY, window.innerHeight - 90);
    setContextMenu({ x, y, user });
  };

  const sortProps = { sortField, sortDir };

  return (
    <div className="flex flex-col gap-6 p-6 w-full min-h-full bg-white">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Users List</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all registered users, roles, and permissions.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 w-60 rounded-full shadow-none"
            />
          </div>

          {/* Role filter */}
          <DropdownMenu>
            {roleFilter === "all" ? (
              <DropdownMenuTrigger asChild>
                <button className="inline-flex h-9 items-center gap-2 rounded-full border border-dashed px-3 text-sm text-muted-foreground outline-none transition-colors hover:border-foreground/30 hover:text-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  Role
                </button>
              </DropdownMenuTrigger>
            ) : (
              <div className="inline-flex h-9 items-center rounded-full border bg-background text-sm">
                <button
                  onClick={() => { setRoleFilter("all"); setPage(1); }}
                  className="pl-2.5 pr-1 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <CircleX className="h-4 w-4" />
                </button>
                <DropdownMenuTrigger className="flex items-center gap-2 py-1.5 pr-3 pl-1 font-semibold outline-none cursor-pointer">
                  Role
                  <span className="h-4 w-px bg-border mx-0.5" />
                  <span className={`h-2 w-2 rounded-full shrink-0 ${ROLE_COLORS[roleFilter] ?? "bg-gray-400"}`} />
                  <span className="font-normal text-muted-foreground">
                    {ROLE_LABELS[roleFilter] ?? roleFilter}
                  </span>
                </DropdownMenuTrigger>
              </div>
            )}
            <DropdownMenuContent align="start" className="w-52">
              {availableRoles.length === 0 ? (
                <DropdownMenuItem disabled>No roles available</DropdownMenuItem>
              ) : (
                availableRoles.map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => { setRoleFilter(role); setPage(1); }}
                    className={roleFilter === role ? "bg-accent" : ""}
                  >
                    <span className={`mr-2 h-2 w-2 rounded-full shrink-0 ${ROLE_COLORS[role] ?? "bg-gray-400"}`} />
                    {ROLE_LABELS[role] ?? role}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Create button */}
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
          onClick={() => setShowCreateModal(true)}
        >
          <UserPlus className="h-4 w-4" />
          Create New User
        </Button>
      </div>

      {/* Table Card */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-10 text-center">#</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("username")}>
                    Username <SortIcon field="username" {...sortProps} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("full_name")}>
                    Full Name <SortIcon field="full_name" {...sortProps} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("email")}>
                    Email <SortIcon field="email" {...sortProps} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("role")}>
                    Role <SortIcon field="role" {...sortProps} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("city")}>
                    City <SortIcon field="city" {...sortProps} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("mobile_no")}>
                    Mobile <SortIcon field="mobile_no" {...sortProps} />
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((u, idx) => (
                    <TableRow
                      key={u.id}
                      className="cursor-context-menu select-none"
                      onContextMenu={(e) => handleContextMenu(e, u)}
                    >
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {(page - 1) * pageSize + idx + 1}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <img
                            src={getProfileImageSrc(u.profile_pic, "/avatar.png")}
                            alt={u.username}
                            className="h-8 w-8 rounded-full object-cover border"
                          />
                          <span className="font-medium">{u.username}</span>
                        </div>
                      </TableCell>

                      <TableCell>{u.full_name || "—"}</TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {u.email || "—"}
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium">
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${ROLE_COLORS[u.role] ?? "bg-gray-400"}`} />
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </TableCell>

                      <TableCell>{u.city || "—"}</TableCell>

                      <TableCell className="text-sm">{u.mobile_no || "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="rounded-md border px-2 py-1 text-sm text-foreground bg-background outline-none cursor-pointer"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <span className="text-xs">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 min-w-[150px] overflow-hidden rounded-md border bg-popover shadow-md text-sm text-popover-foreground"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 hover:bg-accent transition-colors text-left"
            onClick={() => {
              setSelectedUser(contextMenu.user);
              closeContextMenu();
            }}
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
            Edit
          </button>
          <div className="h-px bg-border mx-2" />
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 hover:bg-accent transition-colors text-left text-destructive"
            onClick={() => {
              setUserToDelete(contextMenu.user);
              setShowDeleteModal(true);
              closeContextMenu();
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}

      <CreateUserModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />

      {selectedUser && (
        <EditUserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {showDeleteModal && userToDelete && (
        <ConfirmModal
          title="Delete User"
          description={`Are you sure you want to delete "${userToDelete.username}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={async () => {
            await dispatch(deleteUser(userToDelete.id));
            toast.success("User deleted successfully!");
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          onCancel={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
        />
      )}
    </div>
  );
}
