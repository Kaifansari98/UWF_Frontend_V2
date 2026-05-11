"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NotificationBell from "@/components/NotificationBell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import apiClient from "@/utils/apiClient";
import ConfirmModal from "@/components/ConfirmModal";
import FormSubmissionViewModal from "@/components/FormSubmissionViewModal";
import TreasuryApprovalModal from "@/components/TreasuryApprovalModal";
import SkeletonTable5 from "@/components/skeleton-table-5";
import toast from "react-hot-toast";
import { getRejectionWhatsAppURL } from "@/utils/shareUtils";
import {
  Search,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

type Submission = {
  formId: string;
  firstName?: string;
  fatherName?: string;
  familyName?: string;
  requested_amount?: number;
  mobile?: string;
  alternateMobile?: string;
  submitted_at?: string;
  coordinatorName?: string;
  coordinatorMobile?: string;
  region?: string;
  status?: string;
  [key: string]: unknown;
};

type SortDirection = "asc" | "desc" | null;
type SortField =
  | "formId"
  | "studentName"
  | "requested_amount"
  | "mobile"
  | "alternateMobile"
  | "submitted_at"
  | "coordinatorName"
  | "region"
  | null;

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

function getStudentName(item: Submission): string {
  return `${item.firstName ?? ""} ${item.fatherName ?? ""} ${item.familyName ?? ""}`.trim();
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const year = d.getFullYear();
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
  if (sortDir === "asc") return <ChevronUp className="ml-1 inline h-3.5 w-3.5" />;
  return <ChevronDown className="ml-1 inline h-3.5 w-3.5" />;
}

export default function AcceptedFormsPage() {
  const [acceptedSubmissions, setAcceptedSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [submissionToRevert, setSubmissionToRevert] = useState<Submission | null>(null);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [submissionToReject, setSubmissionToReject] = useState<Submission | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [submissionToApprove, setSubmissionToApprove] = useState<Submission | null>(null);
  const [showTreasuryModal, setShowTreasuryModal] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchAcceptedForms = async () => {
    try {
      const res = await apiClient.get("/submissions/accepted");
      const transformed = res.data.acceptedSubmissions.map((item: Record<string, unknown>) => ({
        ...(item as Submission),
        region: (item.GeneratedForm as Record<string, unknown>)?.region as string | undefined,
        status: (item.GeneratedForm as Record<string, unknown>)?.status as string | undefined,
      }));
      setAcceptedSubmissions(transformed);
    } catch (err) {
      console.error("Error fetching accepted forms", err);
      toast.error("Failed to load accepted forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcceptedForms();
  }, []);

  const handleRevertAcceptance = async () => {
    if (!submissionToRevert) return;
    try {
      await apiClient.put(`/submissions/revert-accept/${submissionToRevert.formId}`);
      toast.success("Form reverted to 'submitted'");
      fetchAcceptedForms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to revert acceptance");
    } finally {
      setShowRevertModal(false);
      setSubmissionToRevert(null);
    }
  };

  const handleReject = async () => {
    if (!submissionToReject) return;
    try {
      const res = await apiClient.put(`/submissions/reject/${submissionToReject.formId}`);
      toast.success(res.data.message || "Form rejected successfully");
      fetchAcceptedForms();
      const whatsappURL = getRejectionWhatsAppURL(submissionToReject.mobile ?? "");
      window.open(whatsappURL, "_blank");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject form");
    } finally {
      setShowRejectModal(false);
      setSubmissionToReject(null);
    }
  };

  const filtered = useMemo(() => {
    let data = [...acceptedSubmissions];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.formId?.toLowerCase().includes(q) ||
          getStudentName(item).toLowerCase().includes(q) ||
          item.mobile?.toLowerCase().includes(q) ||
          item.coordinatorName?.toLowerCase().includes(q) ||
          item.region?.toLowerCase().includes(q)
      );
    }

    if (sortField && sortDir) {
      data.sort((a, b) => {
        if (sortField === "requested_amount") {
          const diff = Number(a.requested_amount ?? 0) - Number(b.requested_amount ?? 0);
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
  }, [acceptedSubmissions, search, sortField, sortDir]);

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
                <BreadcrumbPage>Treasury Review</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 pr-4">
          
          <AnimatedThemeToggler />
        </div>
      </header>

      <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Treasury Review
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review accepted requests before they move to treasury approval.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
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
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonTable5 />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[280px]">Actions</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("formId")}>
                    Form ID
                    <SortIcon field="formId" {...sortProps} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("studentName")}>
                    Student Name
                    <SortIcon field="studentName" {...sortProps} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("requested_amount")}>
                    Requested Amount
                    <SortIcon field="requested_amount" {...sortProps} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("mobile")}>
                    Mobile Number
                    <SortIcon field="mobile" {...sortProps} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("alternateMobile")}>
                    Alternate Number
                    <SortIcon field="alternateMobile" {...sortProps} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("submitted_at")}>
                    Submitted At
                    <SortIcon field="submitted_at" {...sortProps} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("coordinatorName")}>
                    UWF Member
                    <SortIcon field="coordinatorName" {...sortProps} />
                  </TableHead>
                  <TableHead>UWF Mobile</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("region")}>
                    Region
                    <SortIcon field="region" {...sortProps} />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                      No accepted forms found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((item) => (
                    <TableRow key={item.formId}>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5"
                            onClick={() => {
                              setSelectedSubmission(item);
                              setShowViewModal(true);
                            }}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2.5"
                            onClick={() => {
                              setSubmissionToApprove(item);
                              setShowTreasuryModal(true);
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-500/10 hover:text-red-500 dark:border-red-800 text-xs px-2.5"
                            onClick={() => {
                              setSubmissionToReject(item);
                              setShowRejectModal(true);
                            }}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2.5"
                            onClick={() => {
                              setSubmissionToRevert(item);
                              setShowRevertModal(true);
                            }}
                          >
                            Revert Acceptance
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium">{item.formId}</TableCell>
                      <TableCell className="font-medium">{getStudentName(item) || "—"}</TableCell>
                      <TableCell>{item.requested_amount ?? "—"}</TableCell>
                      <TableCell className="text-sm">{item.mobile || "—"}</TableCell>
                      <TableCell className="text-sm">{item.alternateMobile || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDateTime(item.submitted_at)}
                      </TableCell>
                      <TableCell>{item.coordinatorName || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.coordinatorMobile || "—"}</TableCell>
                      <TableCell>{item.region || "—"}</TableCell>
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
          title="Revert Accepted Form"
          description={`Are you sure you want to revert acceptance of form ${submissionToRevert.formId}?`}
          confirmText="Revert"
          cancelText="Cancel"
          onConfirm={handleRevertAcceptance}
          onCancel={() => {
            setShowRevertModal(false);
            setSubmissionToRevert(null);
          }}
        />
      )}

      {showRejectModal && submissionToReject && (
        <ConfirmModal
          title="Reject Form"
          description={`Are you sure you want to reject form ${submissionToReject.formId}?`}
          confirmText="Reject"
          cancelText="Cancel"
          onConfirm={handleReject}
          onCancel={() => {
            setShowRejectModal(false);
            setSubmissionToReject(null);
          }}
        />
      )}

      {showTreasuryModal && submissionToApprove && (
        <TreasuryApprovalModal
          submission={submissionToApprove}
          onClose={() => {
            setShowTreasuryModal(false);
            setSubmissionToApprove(null);
          }}
          onSuccess={() => {
            setShowTreasuryModal(false);
            setSubmissionToApprove(null);
            fetchAcceptedForms();
          }}
        />
      )}
      </div>
    </div>
  );
}
