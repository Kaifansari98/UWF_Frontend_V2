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
import ConfirmModal from "@/components/ConfirmModal";
import FormSubmissionViewModal from "@/components/FormSubmissionViewModal";
import {
  Download,
  Search,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  FileSpreadsheet,
  CalendarDays,
  CircleX,
} from "lucide-react";
import { exportClosedFormsToExcel } from "@/utils/exportClosedFormsToExcel";
import { exportCurrentYearClosedFormsToExcel } from "@/utils/exportCurrentYearClosedFormsToExcel";

type SortDirection = "asc" | "desc" | null;
type SortField =
  | "formId"
  | "studentName"
  | "acceptedAmount"
  | "mobile"
  | "coordinatorName"
  | "region"
  | null;

interface Submission {
  formId: string;
  firstName?: string;
  fatherName?: string;
  familyName?: string;
  acceptedAmount?: number;
  mobile?: string;
  alternateMobile?: string;
  coordinatorName?: string;
  coordinatorMobile?: string;
  region?: string;
  createdAt?: string;
  created_at?: string;
  AcknowledgementForm?: unknown;
  [key: string]: unknown;
}

const PAGE_SIZE_OPTIONS = [20, 30, 40, 50];

function getStudentName(s: Submission): string {
  return `${s.firstName ?? ""} ${s.fatherName ?? ""} ${s.familyName ?? ""}`.trim();
}

function getFinancialYear(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const month = date.getMonth(); // 0 = Jan, 3 = April
  const year = date.getFullYear();
  const fyStart = month >= 3 ? year : year - 1;
  return `${fyStart} → ${fyStart + 1}`;
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

export default function ClosedFormsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [submissionToRevert, setSubmissionToRevert] = useState<Submission | null>(null);

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchClosedForms = async () => {
    try {
      const res = await apiClient.get("/submissions/case-closed");
      const transformed: Submission[] = res.data.caseClosedForms.map(
        (item: Record<string, unknown>) => ({
          ...(item as Submission),
          region: (item.GeneratedForm as Record<string, unknown>)?.region,
        })
      );
      setSubmissions(transformed);
    } catch (err) {
      console.error("Failed to load closed forms", err);
      toast.error("Failed to load closed forms");
    } finally {
      setLoading(false);
    }
  };

  const handleRevertToDisbursement = async () => {
    if (!submissionToRevert) return;
    try {
      const res = await apiClient.put(
        `/submissions/revert-case-closed/${submissionToRevert.formId}`
      );
      toast.success((res.data as { message?: string }).message || "Reverted to disbursement");
      fetchClosedForms();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Failed to revert to disbursement");
    } finally {
      setShowRevertModal(false);
      setSubmissionToRevert(null);
    }
  };

  useEffect(() => {
    fetchClosedForms();
  }, []);

  const financialYears = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => {
      const fy = getFinancialYear(s.createdAt ?? s.created_at);
      if (fy) set.add(fy);
    });
    return [...set].sort();
  }, [submissions]);

  const filtered = useMemo(() => {
    let data = [...submissions];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (s) =>
          s.formId?.toLowerCase().includes(q) ||
          getStudentName(s).toLowerCase().includes(q) ||
          s.mobile?.toLowerCase().includes(q) ||
          s.coordinatorName?.toLowerCase().includes(q) ||
          s.region?.toLowerCase().includes(q)
      );
    }

    if (yearFilter !== "all") {
      data = data.filter(
        (s) => getFinancialYear(s.createdAt ?? s.created_at) === yearFilter
      );
    }

    if (sortField && sortDir) {
      data.sort((a, b) => {
        if (sortField === "acceptedAmount") {
          const diff = Number(a.acceptedAmount ?? 0) - Number(b.acceptedAmount ?? 0);
          return sortDir === "asc" ? diff : -diff;
        }
        const aVal =
          sortField === "studentName" ? getStudentName(a) : String(a[sortField] ?? "");
        const bVal =
          sortField === "studentName" ? getStudentName(b) : String(b[sortField] ?? "");
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }

    return data;
  }, [submissions, search, yearFilter, sortField, sortDir]);

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
          Closed Cases
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor and manage all closed student aid cases efficiently.
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 w-60 rounded-full shadow-none"
            />
          </div>

          {/* Financial Year filter */}
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
                  className="pl-2.5 pr-1 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <CircleX className="h-4 w-4" />
                </button>
                <DropdownMenuTrigger className="flex items-center gap-2 py-1.5 pr-3 pl-1 font-semibold outline-none cursor-pointer">
                  Financial Year
                  <span className="h-4 w-px bg-border mx-0.5" />
                  <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="font-normal text-muted-foreground">{yearFilter}</span>
                </DropdownMenuTrigger>
              </div>
            )}
            <DropdownMenuContent align="start" className="w-44">
              {financialYears.length === 0 ? (
                <DropdownMenuItem disabled>No data available</DropdownMenuItem>
              ) : (
                financialYears.map((fy) => (
                  <DropdownMenuItem
                    key={fy}
                    onClick={() => {
                      setYearFilter(fy);
                      setPage(1);
                    }}
                    className={yearFilter === fy ? "bg-accent" : ""}
                  >
                    <span className="mr-2 h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                    {fy}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-1">
          <button
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 hover:text-green-800 dark:text-green-400 dark:hover:bg-green-900/40"
            onClick={async () => {
              try {
                await exportClosedFormsToExcel();
                toast.success("Excel downloaded");
              } catch {
                toast.error("No closed cases found");
              }
            }}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export All
          </button>

          <div className="h-5 w-px bg-border" />

          <button
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={async () => {
              try {
                await exportCurrentYearClosedFormsToExcel();
                toast.success(`${new Date().getFullYear()} Excel downloaded`);
              } catch (err: unknown) {
                const msg =
                  (err as { message?: string })?.message ||
                  "Failed to download current year data";
                toast.error(msg);
              }
            }}
          >
            <Download className="h-4 w-4" />
            {new Date().getFullYear()}
          </button>
        </div>
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
                    onClick={() => handleSort("acceptedAmount")}
                  >
                    Accepted Amount
                    <SortIcon field="acceptedAmount" {...sortProps} />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("mobile")}
                  >
                    Mobile
                    <SortIcon field="mobile" {...sortProps} />
                  </TableHead>
                  <TableHead>Alt. Mobile</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("coordinatorName")}
                  >
                    UWF Member
                    <SortIcon field="coordinatorName" {...sortProps} />
                  </TableHead>
                  <TableHead>Member Mobile</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("region")}
                  >
                    Region
                    <SortIcon field="region" {...sortProps} />
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
                      No closed cases found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((s) => (
                    <TableRow
                      key={s.formId}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedSubmission({
                          ...s,
                          acknowledgement: s.AcknowledgementForm,
                        });
                        setShowViewModal(true);
                      }}
                    >
                      <TableCell className="font-mono text-xs font-medium">
                        {s.formId}
                      </TableCell>

                      <TableCell className="font-medium">
                        {getStudentName(s) || "—"}
                      </TableCell>

                      <TableCell>
                        {s.acceptedAmount != null ? (
                          <span className="font-medium">
                            ₹{Number(s.acceptedAmount).toLocaleString("en-IN")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell className="text-sm">{s.mobile || "—"}</TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {s.alternateMobile || "—"}
                      </TableCell>

                      <TableCell>{s.coordinatorName || "—"}</TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {s.coordinatorMobile || "—"}
                      </TableCell>

                      <TableCell>{s.region || "—"}</TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Closed
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

      {showRevertModal && submissionToRevert && (
        <ConfirmModal
          title="Revert to Disbursement"
          description={`Are you sure you want to revert form ${submissionToRevert.formId} to disbursement status?`}
          confirmText="Revert"
          cancelText="Cancel"
          onConfirm={handleRevertToDisbursement}
          onCancel={() => {
            setShowRevertModal(false);
            setSubmissionToRevert(null);
          }}
        />
      )}
    </div>
  );
}
