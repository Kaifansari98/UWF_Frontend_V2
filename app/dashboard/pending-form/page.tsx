"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import FormSubmissionViewModal from "@/components/FormSubmissionViewModal";
import ConfirmModal from "@/components/ConfirmModal";
import { getAcknowledgementWhatsAppURL } from "@/utils/shareUtils";
import {
  Search,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  CalendarDays,
  CircleX,
  MessageCircle,
  Trash2,
} from "lucide-react";

type SortDirection = "asc" | "desc" | null;
type SortField =
  | "formId"
  | "studentName"
  | "mobile"
  | "class"
  | "coordinatorName"
  | "academicYear"
  | null;

interface AckItem {
  formId: string;
  formSubmission: {
    firstName?: string;
    fatherName?: string;
    familyName?: string;
    mobile?: string;
    alternateMobile?: string;
    class?: string;
    coordinatorName?: string;
    coordinatorMobile?: string;
    academicYear?: string;
    [key: string]: unknown;
  };
  acknowledgement: {
    form_link?: string;
    status?: string;
    [key: string]: unknown;
  };
}

const PAGE_SIZE_OPTIONS = [20, 30, 40, 50];

function getStudentName(item: AckItem): string {
  const s = item.formSubmission;
  return `${s.firstName ?? ""} ${s.fatherName ?? ""} ${s.familyName ?? ""}`.trim();
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
  if (sortField !== field)
    return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-muted-foreground/50" />;
  if (sortDir === "asc") return <ChevronUp className="ml-1 inline h-3.5 w-3.5" />;
  return <ChevronDown className="ml-1 inline h-3.5 w-3.5" />;
}

export default function PendingAcknowledgementPage() {
  const [ackForms, setAckForms] = useState<AckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Record<string, unknown> | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchPendingAcknowledgements = async () => {
    try {
      const res = await apiClient.get("/acknowledgement/pending");
      setAckForms(res.data.data);
    } catch (err) {
      toast.error("Failed to load pending acknowledgements");
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAcknowledgements();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!formToDelete) return;
    try {
      await apiClient.delete(`/acknowledgement/pending/${formToDelete}`);
      toast.success("Acknowledgement form deleted.");
      fetchPendingAcknowledgements();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to delete acknowledgement form.";
      toast.error(message);
    } finally {
      setShowDeleteConfirm(false);
      setFormToDelete(null);
    }
  };

  const academicYears = useMemo(() => {
    const set = new Set<string>();
    ackForms.forEach((item) => {
      const y = item.formSubmission?.academicYear;
      if (y) set.add(y);
    });
    return [...set].sort();
  }, [ackForms]);

  const filtered = useMemo(() => {
    let data = [...ackForms];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.formId?.toLowerCase().includes(q) ||
          getStudentName(item).toLowerCase().includes(q) ||
          item.formSubmission?.mobile?.toLowerCase().includes(q) ||
          item.formSubmission?.coordinatorName?.toLowerCase().includes(q) ||
          item.formSubmission?.class?.toLowerCase().includes(q)
      );
    }

    if (yearFilter !== "all") {
      data = data.filter((item) => item.formSubmission?.academicYear === yearFilter);
    }

    if (sortField && sortDir) {
      data.sort((a, b) => {
        const aVal =
          sortField === "studentName"
            ? getStudentName(a)
            : sortField === "formId"
            ? String(a.formId ?? "")
            : String((a.formSubmission as Record<string, unknown>)?.[sortField] ?? "");
        const bVal =
          sortField === "studentName"
            ? getStudentName(b)
            : sortField === "formId"
            ? String(b.formId ?? "")
            : String((b.formSubmission as Record<string, unknown>)?.[sortField] ?? "");
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }

    return data;
  }, [ackForms, search, yearFilter, sortField, sortDir]);

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

  const sortProps = { sortField, sortDir };

  return (
    <div className="flex flex-col gap-6 p-6 w-full min-h-full bg-white">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Pending Acknowledgement Forms
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send acknowledgement links via WhatsApp or remove pending forms.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 w-60 rounded-full shadow-none"
          />
        </div>

        {/* Academic Year filter */}
        <DropdownMenu>
          {yearFilter === "all" ? (
            <DropdownMenuTrigger asChild>
              <button className="inline-flex h-9 items-center gap-2 rounded-full border border-dashed px-3 text-sm text-muted-foreground outline-none transition-colors hover:border-foreground/30 hover:text-foreground">
                <CalendarDays className="h-4 w-4" />
                Academic Year
              </button>
            </DropdownMenuTrigger>
          ) : (
            <div className="inline-flex h-9 items-center rounded-full border bg-background text-sm">
              <button
                onClick={() => {
                  setYearFilter("all");
                  setPage(1);
                }}
                className="pl-2.5 pr-1 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <CircleX className="h-4 w-4" />
              </button>
              <DropdownMenuTrigger className="flex items-center gap-2 py-1.5 pr-3 pl-1 font-semibold outline-none cursor-pointer">
                Academic Year
                <span className="h-4 w-px bg-border mx-0.5" />
                <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                <span className="font-normal text-muted-foreground">{yearFilter}</span>
              </DropdownMenuTrigger>
            </div>
          )}
          <DropdownMenuContent align="start" className="w-44">
            {academicYears.length === 0 ? (
              <DropdownMenuItem disabled>No data available</DropdownMenuItem>
            ) : (
              academicYears.map((y) => (
                <DropdownMenuItem
                  key={y}
                  onClick={() => {
                    setYearFilter(y);
                    setPage(1);
                  }}
                  className={yearFilter === y ? "bg-accent" : ""}
                >
                  <span className="mr-2 h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                  {y}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
                  <TableHead className="w-[140px]">Actions</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("formId")}
                  >
                    Form ID
                    <SortIcon field="formId" {...sortProps} />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("studentName")}
                  >
                    Student Name
                    <SortIcon field="studentName" {...sortProps} />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("mobile")}
                  >
                    Mobile
                    <SortIcon field="mobile" {...sortProps} />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("class")}
                  >
                    Class
                    <SortIcon field="class" {...sortProps} />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("coordinatorName")}
                  >
                    UWF Member
                    <SortIcon field="coordinatorName" {...sortProps} />
                  </TableHead>
                  <TableHead>Member Contact</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("academicYear")}
                  >
                    Academic Year
                    <SortIcon field="academicYear" {...sortProps} />
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No pending acknowledgement forms found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((item) => (
                    <TableRow
                      key={item.formId}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedSubmission({
                          ...item.formSubmission,
                          formId: item.formId,
                          acknowledgement: item.acknowledgement,
                        });
                        setShowViewModal(true);
                      }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            className="gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2.5"
                            onClick={() => {
                              const url = getAcknowledgementWhatsAppURL(
                                item.formSubmission?.mobile ?? "",
                                item.acknowledgement?.form_link ?? ""
                              );
                              window.open(url, "_blank");
                            }}
                          >
                            <MessageCircle size={13} />
                            WhatsApp
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs px-2.5"
                            onClick={() => {
                              setFormToDelete(item.formId);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 size={13} />
                            Delete
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs font-medium">
                        {item.formId}
                      </TableCell>

                      <TableCell className="font-medium">
                        {getStudentName(item) || "—"}
                      </TableCell>

                      <TableCell className="text-sm">
                        {item.formSubmission?.mobile || "—"}
                      </TableCell>

                      <TableCell className="text-sm">
                        {item.formSubmission?.class || "—"}
                      </TableCell>

                      <TableCell>
                        {item.formSubmission?.coordinatorName || "—"}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {item.formSubmission?.coordinatorMobile || "—"}
                      </TableCell>

                      <TableCell className="text-sm">
                        {item.formSubmission?.academicYear || "—"}
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Pending
                        </span>
                      </TableCell>
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
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-md border px-2 py-1 text-sm text-foreground bg-background outline-none cursor-pointer"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {showViewModal && selectedSubmission && (
        <FormSubmissionViewModal
          submission={selectedSubmission}
          onClose={() => {
            setShowViewModal(false);
            setSelectedSubmission(null);
          }}
        />
      )}

      {showDeleteConfirm && formToDelete && (
        <ConfirmModal
          title="Delete Acknowledgement Form"
          description={`Are you sure you want to delete form ${formToDelete}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setFormToDelete(null);
          }}
        />
      )}
    </div>
  );
}
