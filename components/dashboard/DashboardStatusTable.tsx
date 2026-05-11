"use client";

import { useEffect, useMemo, useState } from "react";
import apiClient from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SkeletonTable5 from "@/components/skeleton-table-5";
import {
  Search,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  FileText,
} from "lucide-react";

type Form = {
  formId: string;
  student_name: string;
  status: string;
  form_link: string;
  created_on: string;
};

type Props = {
  filter: string;
};

type SortDirection = "asc" | "desc" | null;
type SortField = "formId" | "student_name" | "status" | "created_on" | null;

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

const getFinancialYearKey = (dateInput: string) => {
  const date = new Date(dateInput);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const startYear = month >= 3 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
};

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
  if (sortDir === "asc") return <ChevronUp className="ml-1 inline h-3.5 w-3.5" />;
  return <ChevronDown className="ml-1 inline h-3.5 w-3.5" />;
}

export default function DashboardStatusTable({ filter }: Props) {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/forms/all");
        const filteredForms =
          filter === "overall"
            ? res.data.forms || []
            : (res.data.forms || []).filter(
                (form: Form) => getFinancialYearKey(form.created_on) === filter
              );
        setForms(filteredForms);
      } catch (error) {
        console.error("Failed to fetch forms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [filter]);

  const filtered = useMemo(() => {
    let data = [...forms];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (form) =>
          form.formId?.toLowerCase().includes(q) ||
          form.student_name?.toLowerCase().includes(q) ||
          form.status?.toLowerCase().includes(q)
      );
    }

    if (sortField && sortDir) {
      data.sort((a, b) => {
        const aVal = String(a[sortField] ?? "");
        const bVal = String(b[sortField] ?? "");
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }

    return data;
  }, [forms, search, sortField, sortDir]);

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
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="border-b px-4 py-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search forms..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 rounded-full shadow-none"
          />
        </div>
      </div>

      {loading ? (
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
                  onClick={() => handleSort("status")}
                >
                  Status
                  <SortIcon field="status" {...sortProps} />
                </TableHead>
                <TableHead>Form Link</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("created_on")}
                >
                  Created At
                  <SortIcon field="created_on" {...sortProps} />
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No forms found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((form) => (
                  <TableRow key={form.formId}>
                    <TableCell className="font-mono text-xs font-medium">
                      {form.formId}
                    </TableCell>

                    <TableCell className="font-medium">
                      {form.student_name || "—"}
                    </TableCell>

                    <TableCell className="capitalize">
                      {form.status || "—"}
                    </TableCell>

                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => window.open(form.form_link, "_blank", "noopener,noreferrer")}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Open Form
                      </Button>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatCreatedOn(form.created_on)}
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
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-md border px-2 py-1 text-sm text-foreground bg-background outline-none cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
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
  );
}
