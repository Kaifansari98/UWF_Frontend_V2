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
import {
  Search,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  MapPin,
  CalendarDays,
  CircleX,
} from "lucide-react";

type SortDirection = "asc" | "desc" | null;
type SortField = "formId" | "studentName" | "region" | "submitted_at" | null;

interface RejectedItem {
  formId: string;
  firstName?: string;
  fatherName?: string;
  familyName?: string;
  region?: string;
  submitted_at?: string;
  [key: string]: unknown;
}

const PAGE_SIZE_OPTIONS = [20, 30, 40, 50];

function getStudentName(item: RejectedItem): string {
  return `${item.firstName ?? ""} ${item.fatherName ?? ""} ${item.familyName ?? ""}`.trim();
}

function getFinancialYear(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const month = date.getMonth();
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

export default function RejectedFormsPage() {
  const [rejectedForms, setRejectedForms] = useState<RejectedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [revertTarget, setRevertTarget] = useState<RejectedItem | null>(null);

  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchRejectedForms = async () => {
    try {
      const res = await apiClient.get("/submissions/rejected");
      const transformed = res.data.rejectedSubmissions.map((item: any) => ({
        ...item,
        region: item.GeneratedForm?.region ?? item.region,
      }));
      setRejectedForms(transformed);
    } catch (err) {
      toast.error("Failed to load rejected forms");
      console.error("Failed to fetch rejected forms", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectedForms();
  }, []);

  const handleRevert = async () => {
    if (!revertTarget) return;
    try {
      await apiClient.put(`/submissions/revert-rejection/${revertTarget.formId}`);
      toast.success("Rejection reverted");
      fetchRejectedForms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to revert");
    } finally {
      setShowConfirmModal(false);
      setRevertTarget(null);
    }
  };

  const regions = useMemo(() => {
    const set = new Set<string>();
    rejectedForms.forEach((item) => {
      if (item.region) set.add(item.region);
    });
    return [...set].sort();
  }, [rejectedForms]);

  const financialYears = useMemo(() => {
    const set = new Set<string>();
    rejectedForms.forEach((item) => {
      const fy = getFinancialYear(item.submitted_at);
      if (fy) set.add(fy);
    });
    return [...set].sort();
  }, [rejectedForms]);

  const filtered = useMemo(() => {
    let data = [...rejectedForms];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.formId?.toLowerCase().includes(q) ||
          getStudentName(item).toLowerCase().includes(q) ||
          item.region?.toLowerCase().includes(q)
      );
    }

    if (regionFilter !== "all") {
      data = data.filter((item) => item.region === regionFilter);
    }

    if (yearFilter !== "all") {
      data = data.filter((item) => getFinancialYear(item.submitted_at) === yearFilter);
    }

    if (sortField && sortDir) {
      data.sort((a, b) => {
        const aVal =
          sortField === "studentName"
            ? getStudentName(a)
            : String(a[sortField] ?? "");
        const bVal =
          sortField === "studentName"
            ? getStudentName(b)
            : String(b[sortField] ?? "");
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }

    return data;
  }, [rejectedForms, search, regionFilter, yearFilter, sortField, sortDir]);

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
          Rejected Requests
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage all rejected student form submissions.
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

          {/* Region filter */}
          <DropdownMenu>
            {regionFilter === "all" ? (
              <DropdownMenuTrigger asChild>
                <button className="inline-flex h-9 items-center gap-2 rounded-full border border-dashed px-3 text-sm text-muted-foreground outline-none transition-colors hover:border-foreground/30 hover:text-foreground">
                  <MapPin className="h-4 w-4" />
                  Region
                </button>
              </DropdownMenuTrigger>
            ) : (
              <div className="inline-flex h-9 items-center rounded-full border bg-background text-sm">
                <button
                  onClick={() => {
                    setRegionFilter("all");
                    setPage(1);
                  }}
                  className="pl-2.5 pr-1 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <CircleX className="h-4 w-4" />
                </button>
                <DropdownMenuTrigger className="flex items-center gap-2 py-1.5 pr-3 pl-1 font-semibold outline-none cursor-pointer">
                  Region
                  <span className="h-4 w-px bg-border mx-0.5" />
                  <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
                  <span className="font-normal text-muted-foreground">{regionFilter}</span>
                </DropdownMenuTrigger>
              </div>
            )}
            <DropdownMenuContent align="start" className="w-44">
              {regions.length === 0 ? (
                <DropdownMenuItem disabled>No data available</DropdownMenuItem>
              ) : (
                regions.map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => {
                      setRegionFilter(r);
                      setPage(1);
                    }}
                    className={regionFilter === r ? "bg-accent" : ""}
                  >
                    <span className="mr-2 h-2 w-2 rounded-full bg-red-400 shrink-0" />
                    {r}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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
                    onClick={() => handleSort("region")}
                  >
                    Region
                    <SortIcon field="region" {...sortProps} />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("submitted_at")}
                  >
                    Submitted At
                    <SortIcon field="submitted_at" {...sortProps} />
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No rejected forms found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((item) => (
                    <TableRow
                      key={item.formId}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedSubmission(item);
                        setShowViewModal(true);
                      }}
                    >
                      <TableCell className="font-mono text-xs font-medium">
                        {item.formId}
                      </TableCell>

                      <TableCell className="font-medium">
                        {getStudentName(item) || "—"}
                      </TableCell>

                      <TableCell className="text-sm">
                        {item.region || "—"}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {item.submitted_at
                          ? new Date(item.submitted_at as string).toLocaleString()
                          : "—"}
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Rejected
                        </span>
                      </TableCell>

                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-700 border-green-200 hover:bg-green-50 hover:text-green-800"
                          onClick={() => {
                            setRevertTarget(item);
                            setShowConfirmModal(true);
                          }}
                        >
                          Revert Rejection
                        </Button>
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

      {showConfirmModal && revertTarget && (
        <ConfirmModal
          title="Revert Rejection"
          description={`Are you sure you want to revert rejection for Form ID ${revertTarget.formId}?`}
          confirmText="Revert"
          cancelText="Cancel"
          onConfirm={handleRevert}
          onCancel={() => {
            setShowConfirmModal(false);
            setRevertTarget(null);
          }}
        />
      )}
    </div>
  );
}
