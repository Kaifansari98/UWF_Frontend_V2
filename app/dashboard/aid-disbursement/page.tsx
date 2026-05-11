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
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";
import SkeletonTable5 from "@/components/skeleton-table-5";
import { pdf } from "@react-pdf/renderer";
import BankDetailsPDF from "@/components/pdf/BankDetailsPDF";
import { getDisbursementWhatsAppURL } from "@/utils/shareUtils";
import { Search, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

type Submission = {
  formId: string;
  firstName?: string;
  fatherName?: string;
  familyName?: string;
  acceptedAmount?: number;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  region?: string;
  mobile?: string;
  [key: string]: unknown;
};

type SortDirection = "asc" | "desc" | null;
type SortField =
  | "formId"
  | "studentName"
  | "acceptedAmount"
  | "bankAccountHolder"
  | "bankAccountNumber"
  | "ifscCode"
  | "bankName"
  | null;

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

function getStudentName(item: Submission): string {
  return `${item.firstName ?? ""} ${item.fatherName ?? ""} ${item.familyName ?? ""}`.trim();
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDirection }) {
  if (sortField !== field) return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-muted-foreground/50" />;
  if (sortDir === "asc") return <ChevronUp className="ml-1 inline h-3.5 w-3.5" />;
  return <ChevronDown className="ml-1 inline h-3.5 w-3.5" />;
}

export default function AidDisbursementPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [submissionToRevert, setSubmissionToRevert] = useState<Submission | null>(null);
  const [showCaseCloseModal, setShowCaseCloseModal] = useState(false);
  const [submissionToClose, setSubmissionToClose] = useState<Submission | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchDisbursedForms = async () => {
    try {
      const res = await apiClient.get("/submissions/disbursed/all");
      const transformed = res.data.disbursedForms.map((item: Record<string, unknown>) => ({
        ...(item as Submission),
        region: (item.GeneratedForm as Record<string, unknown>)?.region as string | undefined,
      }));
      setSubmissions(transformed);
    } catch (err) {
      console.error("Failed to load disbursed forms", err);
      toast.error("Failed to load disbursed forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisbursedForms();
  }, []);

  const handleRevertBack = async () => {
    if (!submissionToRevert) return;
    try {
      const res = await apiClient.put(`/submissions/revertDisbursementStatus/${submissionToRevert.formId}`);
      toast.success(res.data.message || "Disbursement reverted successfully");
      fetchDisbursedForms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to revert disbursement");
    } finally {
      setShowRevertModal(false);
      setSubmissionToRevert(null);
    }
  };

  const handleCaseClose = async () => {
    if (!submissionToClose) return;
    try {
      const res = await apiClient.put(`/submissions/close-case/${submissionToClose.formId}`);
      toast.success(res.data.message || "Form marked as case closed");
      if (submissionToClose.mobile) {
        const whatsappURL = getDisbursementWhatsAppURL(submissionToClose.mobile);
        window.open(whatsappURL, "_blank");
      }
      fetchDisbursedForms();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to mark form as case closed");
    } finally {
      setShowCaseCloseModal(false);
      setSubmissionToClose(null);
    }
  };

  const handleGenerateAcknowledgement = async () => {
    if (!submissionToClose) return;
    try {
      await apiClient.post("/acknowledgement/generate", { formId: submissionToClose.formId });
      toast.success("Acknowledgement link generated");
      fetchDisbursedForms();
      setShowCaseCloseModal(false);
      setSubmissionToClose(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate acknowledgement");
      console.error("Ack Generation Error:", err);
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
          item.bankAccountHolder?.toLowerCase().includes(q) ||
          item.bankName?.toLowerCase().includes(q)
      );
    }
    if (sortField && sortDir) {
      data.sort((a, b) => {
        if (sortField === "acceptedAmount") {
          const diff = Number(a.acceptedAmount ?? 0) - Number(b.acceptedAmount ?? 0);
          return sortDir === "asc" ? diff : -diff;
        }
        const aVal = sortField === "studentName" ? getStudentName(a) : String(a[sortField] ?? "");
        const bVal = sortField === "studentName" ? getStudentName(b) : String(b[sortField] ?? "");
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
  const sortProps = { sortField, sortDir };

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
                <BreadcrumbPage>Aid Disbursement</BreadcrumbPage>
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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Aid Disbursement</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Process disbursed cases, issue acknowledgements, and move them to case closure.
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
                  <TableHead className="w-[300px]">Actions</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("formId")}>Form ID<SortIcon field="formId" {...sortProps} /></TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("studentName")}>Student Name<SortIcon field="studentName" {...sortProps} /></TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("acceptedAmount")}>Accepted Amount<SortIcon field="acceptedAmount" {...sortProps} /></TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("bankAccountHolder")}>Account Holder Name<SortIcon field="bankAccountHolder" {...sortProps} /></TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("bankAccountNumber")}>Bank Account No.<SortIcon field="bankAccountNumber" {...sortProps} /></TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("ifscCode")}>IFSC Code<SortIcon field="ifscCode" {...sortProps} /></TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("bankName")}>Bank Name<SortIcon field="bankName" {...sortProps} /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No disbursed forms found.</TableCell></TableRow>
                ) : (
                  paginated.map((item) => (
                    <TableRow key={item.formId}>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5" onClick={() => { setSelectedSubmission(item); setShowViewModal(true); }}>View</Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs px-2.5" onClick={() => { setSubmissionToClose(item); setShowCaseCloseModal(true); }}>Amount Disbursed</Button>
                          <Button
                            size="sm"
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2.5"
                            onClick={async () => {
                              const blob = await pdf(<BankDetailsPDF submission={item} />).toBlob();
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = `${item.formId}_BankDetails.pdf`;
                              link.click();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            Download
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-500/10 hover:text-red-500 dark:border-red-800 text-xs px-2.5" onClick={() => { setSubmissionToRevert(item); setShowRevertModal(true); }}>Revert</Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium">{item.formId}</TableCell>
                      <TableCell className="font-medium">{getStudentName(item) || "—"}</TableCell>
                      <TableCell>{item.acceptedAmount != null ? `₹ ${item.acceptedAmount}` : "—"}</TableCell>
                      <TableCell>{item.bankAccountHolder || "—"}</TableCell>
                      <TableCell>{item.bankAccountNumber || "—"}</TableCell>
                      <TableCell>{item.ifscCode || "—"}</TableCell>
                      <TableCell>{item.bankName || "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="rounded-md border px-2 py-1 text-sm text-foreground bg-background outline-none cursor-pointer">
                  {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <span className="text-xs">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
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
          title="Revert Disbursed Form"
          description={`Are you sure you want to revert disbursement for form ${submissionToRevert.formId}?`}
          confirmText="Revert"
          cancelText="Cancel"
          onConfirm={handleRevertBack}
          onCancel={() => {
            setShowRevertModal(false);
            setSubmissionToRevert(null);
          }}
        />
      )}

      {showCaseCloseModal && submissionToClose && (
        <ConfirmModal
          title="Mark Case as Disbursed"
          description={`Are you sure you want to close request ${submissionToClose.formId}?`}
          confirmText="Case Closure"
          cancelText="Cancel"
          onConfirm={handleCaseClose}
          onCancel={() => {
            setShowCaseCloseModal(false);
            setSubmissionToClose(null);
          }}
          showThirdButton={true}
          thirdButtonText="Aid Acknowledgement"
          onThirdAction={() => {
            handleGenerateAcknowledgement();
          }}
        />
      )}
      </div>
    </div>
  );
}
