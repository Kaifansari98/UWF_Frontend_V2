"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import NotificationBell from "@/components/NotificationBell";
import FormGenerationModal from "@/components/FormGeneration/FormGenerationModal";
import ConfirmModal from "@/components/ConfirmModal";
import SkeletonTable5 from "@/components/skeleton-table-5";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import apiClient from "@/utils/apiClient";
import { getGmailShareURL, getWhatsAppShareURL } from "@/utils/shareUtils";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  CircleX,
  FilePlus2,
  FileText,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";

type SortDirection = "asc" | "desc" | null;
type SortField = "formId" | "student_name" | "region" | "created_on" | null;

interface PendingForm {
  id?: number;
  formId: string;
  student_name?: string;
  region?: string;
  form_link?: string;
  created_on?: string;
  [key: string]: unknown;
}

interface ContextMenuState {
  x: number;
  y: number;
  form: PendingForm;
}

const PAGE_SIZE_OPTIONS = [20, 30, 40, 50];
const PENDING_REQUESTS_QUERY_KEY = ["pending-requests"] as const;

async function fetchPendingForms(): Promise<PendingForm[]> {
  const response = await apiClient.get("/forms/pending");
  return response.data.forms ?? [];
}

function getFinancialYear(dateStr?: string): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const month = date.getMonth();
  const year = date.getFullYear();
  const fyStart = month >= 3 ? year : year - 1;
  return `${fyStart} → ${fyStart + 1}`;
}

function formatCreatedOn(dateStr?: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();

  return `${time} – ${weekday}, ${day} ${month} ${year}`;
}

function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: SortField;
  sortField: SortField;
  sortDir: SortDirection;
}) {
  if (sortField !== field) {
    return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-muted-foreground/50" />;
  }
  if (sortDir === "asc") {
    return <ChevronUp className="ml-1 inline h-3.5 w-3.5" />;
  }
  return <ChevronDown className="ml-1 inline h-3.5 w-3.5" />;
}

export default function PendingFormsPage() {
  const queryClient = useQueryClient();
  const { data: forms = [], isLoading } = useQuery({
    queryKey: PENDING_REQUESTS_QUERY_KEY,
    queryFn: fetchPendingForms,
  });

  const deleteMutation = useMutation({
    mutationFn: async (formId: string) => {
      await apiClient.delete("/forms/delete", {
        data: { formId },
      });
    },
    onSuccess: async (_, formId) => {
      await queryClient.invalidateQueries({ queryKey: PENDING_REQUESTS_QUERY_KEY });
      toast.success(`Form ${formId} deleted successfully!`);
    },
    onError: () => {
      toast.error("Failed to delete form");
    },
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formIdToDelete, setFormIdToDelete] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  useEffect(() => {
    if (!contextMenu) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeContextMenu();
      }
    };

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [contextMenu, closeContextMenu]);

  const financialYears = useMemo(() => {
    const years = new Set<string>();
    forms.forEach((form) => {
      const financialYear = getFinancialYear(form.created_on);
      if (financialYear) {
        years.add(financialYear);
      }
    });
    return [...years].sort();
  }, [forms]);

  const filtered = useMemo(() => {
    let data = [...forms];

    if (search) {
      const query = search.toLowerCase();
      data = data.filter(
        (form) =>
          form.formId?.toLowerCase().includes(query) ||
          form.student_name?.toLowerCase().includes(query) ||
          form.region?.toLowerCase().includes(query)
      );
    }

    if (yearFilter !== "all") {
      data = data.filter((form) => getFinancialYear(form.created_on) === yearFilter);
    }

    if (sortField && sortDir) {
      data.sort((a, b) => {
        const aValue = String(a[sortField] ?? "");
        const bValue = String(b[sortField] ?? "");
        return sortDir === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }

    return data;
  }, [forms, search, yearFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, page, pageSize]);

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

  const openContextMenuAt = (x: number, y: number, form: PendingForm) => {
    const clampedX = Math.min(x, window.innerWidth - 200);
    const clampedY = Math.min(y, window.innerHeight - 170);
    setContextMenu({ x: clampedX, y: clampedY, form });
  };

  const handleContextMenu = (event: React.MouseEvent, form: PendingForm) => {
    event.preventDefault();
    openContextMenuAt(event.clientX, event.clientY, form);
  };

  const handleMobileDoubleClick = (event: React.MouseEvent, form: PendingForm) => {
    if (window.innerWidth >= 768) return;
    event.preventDefault();
    openContextMenuAt(event.clientX, event.clientY, form);
  };

  const openForm = (formLink?: string) => {
    if (!formLink) return;
    window.open(formLink, "_blank", "noopener,noreferrer");
  };

  const sortProps = { sortField, sortDir };

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Pending Requests</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2 pr-4">
          <Button
            onClick={() => setShowGenerateModal(true)}
            className="gap-2 rounded-sm cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
          >
            <FilePlus2 className="h-4 w-4" />
            Generate New Request
          </Button>
          <div className="flex items-center justify-center rounded-sm bg-blue-500 px-2 py-1">
            <AnimatedThemeToggler className="flex h-7 w-7 items-center text-white justify-center [&_svg]:h-4 [&_svg]:w-4" />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pending Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage generated forms that are still awaiting parent or guardian
            submission.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="w-60 rounded-full pl-9 shadow-none"
              />
            </div>

            <DropdownMenu>
              {yearFilter === "all" ? (
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex h-9 items-center gap-2 rounded-full border border-dashed px-3 text-sm text-muted-foreground outline-none transition-colors hover:border-foreground/30 hover:text-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Financial Year
                  </button>
                </DropdownMenuTrigger>
              ) : (
                <div className="inline-flex h-9 items-center rounded-full border bg-background text-sm">
                  <button
                    onClick={() => {
                      setYearFilter("all");
                      setPage(1);
                    }}
                    className="py-1.5 pl-2.5 pr-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <CircleX className="h-4 w-4" />
                  </button>
                  <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 py-1.5 pl-1 pr-3 font-semibold outline-none">
                    Financial Year
                    <span className="mx-0.5 h-4 w-px bg-border" />
                    <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                    <span className="font-normal text-muted-foreground">{yearFilter}</span>
                  </DropdownMenuTrigger>
                </div>
              )}

              <DropdownMenuContent align="start" className="w-44">
                {financialYears.length === 0 ? (
                  <DropdownMenuItem disabled>No data available</DropdownMenuItem>
                ) : (
                  financialYears.map((financialYear) => (
                    <DropdownMenuItem
                      key={financialYear}
                      onClick={() => {
                        setYearFilter(financialYear);
                        setPage(1);
                      }}
                      className={yearFilter === financialYear ? "bg-accent" : ""}
                    >
                      <span className="mr-2 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                      {financialYear}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          {isLoading ? (
            <div className="p-6">
              <SkeletonTable5 />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("formId")}
                    >
                      Form ID
                      <SortIcon field="formId" {...sortProps} />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("student_name")}
                    >
                      Student Name
                      <SortIcon field="student_name" {...sortProps} />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("region")}
                    >
                      Region
                      <SortIcon field="region" {...sortProps} />
                    </TableHead>
                    <TableHead>Form Link</TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("created_on")}
                    >
                      Created On
                      <SortIcon field="created_on" {...sortProps} />
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No pending requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((form) => (
                      <TableRow
                        key={form.formId}
                        className="cursor-context-menu select-none"
                        onContextMenu={(event) => handleContextMenu(event, form)}
                        onDoubleClick={(event) => handleMobileDoubleClick(event, form)}
                      >
                        <TableCell className="font-mono text-xs font-medium">
                          {form.formId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {form.student_name || "—"}
                        </TableCell>
                        <TableCell>{form.region || "—"}</TableCell>
                        <TableCell onClick={(event) => event.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => openForm(form.form_link)}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Open Form
                          </Button>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatCreatedOn(form.created_on)}
                        </TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) =>
                              openContextMenuAt(
                                event.currentTarget.getBoundingClientRect().right - 180,
                                event.currentTarget.getBoundingClientRect().bottom + 8,
                                form
                              )
                            }
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Rows per page</span>
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setPage(1);
                    }}
                    className="cursor-pointer rounded-md border bg-background px-2 py-1 text-sm text-foreground outline-none"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-xs">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((currentPage) => Math.min(totalPages, currentPage + 1))
                    }
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {contextMenu && (
        <div
          className="fixed z-50 min-w-[190px] overflow-hidden rounded-md border bg-popover text-sm text-popover-foreground shadow-md"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-accent"
            onClick={() => {
              openForm(contextMenu.form.form_link);
              closeContextMenu();
            }}
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
            Open Form
          </button>
          <div className="mx-2 h-px bg-border" />
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-accent"
            onClick={() => {
              window.open(
                getWhatsAppShareURL(contextMenu.form.form_link ?? ""),
                "_blank",
                "noopener,noreferrer"
              );
              closeContextMenu();
            }}
          >
            <MessageCircle className="h-4 w-4 text-green-600" />
            WhatsApp
          </button>
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-accent"
            onClick={() => {
              window.open(
                getGmailShareURL(contextMenu.form.form_link ?? ""),
                "_blank",
                "noopener,noreferrer"
              );
              closeContextMenu();
            }}
          >
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email
          </button>
          <div className="mx-2 h-px bg-border" />
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-destructive transition-colors hover:bg-accent"
            onClick={() => {
              setFormIdToDelete(contextMenu.form.formId);
              setShowDeleteModal(true);
              closeContextMenu();
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}

      {showDeleteModal && formIdToDelete && (
        <ConfirmModal
          title="Delete Form"
          description={`Are you sure you want to delete form "${formIdToDelete}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={async () => {
            try {
              await deleteMutation.mutateAsync(formIdToDelete);
            } finally {
              setShowDeleteModal(false);
              setFormIdToDelete(null);
            }
          }}
          onCancel={() => {
            setShowDeleteModal(false);
            setFormIdToDelete(null);
          }}
        />
      )}

      <FormGenerationModal
        open={showGenerateModal}
        onOpenChange={setShowGenerateModal}
        closeOnSuccess={false}
        onGenerated={async () => {
          await queryClient.invalidateQueries({ queryKey: PENDING_REQUESTS_QUERY_KEY });
        }}
      />
    </div>
  );
}
