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
import FormSubmissionViewModal from "@/components/FormSubmissionViewModal";
import ConfirmModal from "@/components/ConfirmModal";
import EditFormModal from "@/components/EditFormModal";
import SkeletonTable5 from "@/components/skeleton-table-5";
import toast from "react-hot-toast";
import {
  Search,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  getRejectionWhatsAppURL,
  getClarificationWhatsAppURL,
  getAcceptanceWhatsAppURL,
} from "@/utils/shareUtils";

type Submission = {
  formId: string;
  firstName?: string;
  fatherName?: string;
  familyName?: string;
  mobile?: string;
  alternateMobile?: string;
  submitted_at?: string;
  coordinatorName?: string;
  coordinatorMobile?: string;
  region?: string;
  [key: string]: unknown;
};

type SortDirection = "asc" | "desc" | null;
type SortField =
  | "formId"
  | "studentName"
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

export default function SubmittedFormsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<Submission | null>(null);
  const [submissionToReject, setSubmissionToReject] = useState<Submission | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [submissionToAccept, setSubmissionToAccept] = useState<Submission | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchSubmittedForms = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/submissions/submitted");
      const transformed = res.data.submissions.map((item: Record<string, unknown>) => ({
        ...(item as Submission),
        region: (item.GeneratedForm as Record<string, unknown>)?.region as string | undefined,
      }));
      setSubmissions(transformed);
    } catch (err) {
      console.error("Error fetching submissions", err);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmittedForms();
  }, []);

  const confirmDelete = async () => {
    if (!submissionToDelete) return;
    try {
      const res = await apiClient.delete("/submissions/delete", {
        data: { formId: submissionToDelete.formId },
      });
      toast.success(res.data.message || "Form deleted successfully");
      await fetchSubmittedForms();
    } catch (err: any) {
      console.error("Delete failed", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to delete form");
    } finally {
      setShowDeleteModal(false);
      setSubmissionToDelete(null);
    }
  };

  const confirmReject = async () => {
    if (!submissionToReject) return;
    try {
      const res = await apiClient.put(`/submissions/reject/${submissionToReject.formId}`);
      toast.success(res.data.message || "Form rejected successfully");
      await fetchSubmittedForms();
      const whatsappURL = getRejectionWhatsAppURL(submissionToReject.mobile ?? "");
      window.open(whatsappURL, "_blank");
    } catch (err: any) {
      console.error("Reject failed", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to reject form");
    } finally {
      setShowRejectModal(false);
      setSubmissionToReject(null);
    }
  };

  const confirmAccept = async () => {
    if (!submissionToAccept) return;
    try {
      const res = await apiClient.put(`/submissions/accept/${submissionToAccept.formId}`);
      toast.success(res.data.message || "Form accepted successfully");
      await fetchSubmittedForms();
      const whatsappURL = getAcceptanceWhatsAppURL(submissionToAccept.mobile ?? "");
      window.open(whatsappURL, "_blank");
    } catch (err: any) {
      console.error("Accept failed", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to accept form");
    } finally {
      setShowAcceptModal(false);
      setSubmissionToAccept(null);
    }
  };

  const filtered = useMemo(() => {
    let data = [...submissions];

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
        const aVal =
          sortField === "studentName" ? getStudentName(a) : String(a[sortField] ?? "");
        const bVal =
          sortField === "studentName" ? getStudentName(b) : String(b[sortField] ?? "");
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }

    return data;
  }, [submissions, search, sortField, sortDir]);

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
                <BreadcrumbPage>Request Evaluation</BreadcrumbPage>
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
          Requests Submitted For Evaluation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review new submissions, clarify details, edit entries, and accept or reject requests.
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
                  <TableHead className="w-[290px]">Actions</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("formId")}>
                    Form ID
                    <SortIcon field="formId" {...sortProps} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("studentName")}>
                    Student Name
                    <SortIcon field="studentName" {...sortProps} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("mobile")}>
                    Mobile
                    <SortIcon field="mobile" {...sortProps} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("alternateMobile")}>
                    Alt Mobile
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
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                      No submitted forms found.
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
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2.5"
                            onClick={() => {
                              setSelectedSubmission(item);
                              setShowEditModal(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2.5"
                            onClick={() => {
                              setSubmissionToAccept(item);
                              setShowAcceptModal(true);
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-500/10 hover:text-red-500 dark:border-red-800 text-xs px-2.5"
                            onClick={() => {
                              setSubmissionToDelete(item);
                              setShowDeleteModal(true);
                            }}
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            className="bg-zinc-700 hover:bg-zinc-800 text-white text-xs px-2.5"
                            onClick={() => {
                              setSubmissionToReject(item);
                              setShowRejectModal(true);
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs font-medium">{item.formId}</TableCell>
                      <TableCell className="font-medium">{getStudentName(item) || "—"}</TableCell>
                      <TableCell className="text-sm">
                        {item.mobile ? (
                          <a
                            href={getClarificationWhatsAppURL(item.mobile)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline dark:text-green-400"
                          >
                            {item.mobile}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.alternateMobile ? (
                          <a
                            href={getClarificationWhatsAppURL(item.alternateMobile)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline dark:text-green-400"
                          >
                            {item.alternateMobile}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDateTime(item.submitted_at)}
                      </TableCell>
                      <TableCell>{item.coordinatorName || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.coordinatorMobile || "—"}
                      </TableCell>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-xs">Page {page} of {totalPages}</span>
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

      {showDeleteModal && submissionToDelete && (
        <ConfirmModal
          title="Delete Form Submission"
          description={`Are you sure you want to delete form ${submissionToDelete.formId}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSubmissionToDelete(null);
          }}
        />
      )}

      {showViewModal && selectedSubmission && (
        <FormSubmissionViewModal
          submission={selectedSubmission}
          onClose={() => {
            setShowViewModal(false);
            setSelectedSubmission(null);
          }}
        />
      )}

      {showEditModal && selectedSubmission && (
        <EditFormModal
          submission={selectedSubmission}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSubmission(null);
          }}
          onUpdateSuccess={() => {
            setShowEditModal(false);
            setSelectedSubmission(null);
            fetchSubmittedForms();
          }}
        />
      )}

      {showRejectModal && submissionToReject && (
        <ConfirmModal
          title="Reject Form Submission"
          description={`Are you sure you want to reject form ${submissionToReject.formId}?`}
          confirmText="Reject"
          cancelText="Cancel"
          onConfirm={confirmReject}
          onCancel={() => {
            setShowRejectModal(false);
            setSubmissionToReject(null);
          }}
        />
      )}

      {showAcceptModal && submissionToAccept && (
        <ConfirmModal
          title="Accept Form Submission"
          description={`Are you sure you want to accept form ${submissionToAccept.formId}?`}
          confirmText="Accept"
          cancelText="Cancel"
          onConfirm={confirmAccept}
          onCancel={() => {
            setShowAcceptModal(false);
            setSubmissionToAccept(null);
          }}
        />
      )}
      </div>
    </div>
  );
}
