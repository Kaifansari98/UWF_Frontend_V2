"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BankLetterPreviewModal from "@/components/BankLetterPreviewModal";
import toast from "react-hot-toast";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/utils/apiClient";
import { getBankInfoLetterWhatsAppURL } from "@/utils/shareUtils";
import {
  CalendarDays,
  CircleX,
  Download,
  FileText,
  FilePlus2,
  MoreHorizontal,
  MessageCircle,
  Search,
  Trash2,
} from "lucide-react";

type BankInfoLetterForm = {
  principal_headmaster: string;
  school_college_name: string;
  address: string;
  student_name: string;
  admission_no_gr_no: string;
  student_parent_name: string;
  class_course_program: string;
  academic_year_term: string;
  signatory_user_id: string;
};

type UserOption = {
  id: number;
  full_name?: string;
  username?: string;
  role?: string;
};

type BankInfoLetterRow = {
  id: number;
  principal_headmaster: string;
  school_college_name: string;
  address: string;
  student_name: string;
  admission_no_gr_no: string;
  student_parent_name: string;
  class_course_program: string;
  academic_year_term: string;
  signatory_name: string;
  generated_at?: string;
};

type BankInfoLetterResponse = {
  letters: BankInfoLetterRow[];
  financialYears: string[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
};

type ContextMenuState = {
  x: number;
  y: number;
  letter: BankInfoLetterRow;
};

const PAGE_SIZE_OPTIONS = [20, 30, 40, 50];
const BANK_INFO_LETTERS_QUERY_KEY = ["bank-info-letters"] as const;

const initialFormState: BankInfoLetterForm = {
  principal_headmaster: "",
  school_college_name: "",
  address: "",
  student_name: "",
  admission_no_gr_no: "",
  student_parent_name: "",
  class_course_program: "",
  academic_year_term: "",
  signatory_user_id: "",
};

async function fetchUsers(): Promise<UserOption[]> {
  const response = await apiClient.get("/users");
  return response.data.users ?? [];
}

async function searchBankInfoLetters(params: {
  search: string;
  financialYear: string;
  page: number;
  pageSize: number;
}): Promise<BankInfoLetterResponse> {
  const response = await apiClient.post("/bank-info-letters/search", params);
  return response.data;
}

function CreateBankInfoLetterModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState<BankInfoLetterForm>(initialFormState);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["bank-info-letter-users"],
    queryFn: fetchUsers,
    enabled: open,
  });

  const signatoryUsers = useMemo(
    () =>
      users.filter(
        (user) => typeof user.id === "number" && user.role !== "super_admin",
      ),
    [users],
  );

  const resetForm = () => setForm(initialFormState);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const createLetterMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        principal_headmaster: form.principal_headmaster.trim(),
        school_college_name: form.school_college_name.trim(),
        address: form.address.trim(),
        student_name: form.student_name.trim(),
        admission_no_gr_no: form.admission_no_gr_no.trim(),
        student_parent_name: form.student_parent_name.trim(),
        class_course_program: form.class_course_program.trim(),
        academic_year_term: form.academic_year_term.trim(),
        signatory_user_id: Number(form.signatory_user_id),
      };

      return apiClient.post("/bank-info-letters", payload);
    },
    onSuccess: async () => {
      toast.success("Bank info letter created successfully");
      await queryClient.invalidateQueries({
        queryKey: BANK_INFO_LETTERS_QUERY_KEY,
      });
      handleOpenChange(false);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create bank info letter";
      toast.error(message);
    },
  });

  const updateField = (field: keyof BankInfoLetterForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = () => {
    const requiredFields: Array<keyof BankInfoLetterForm> = [
      "principal_headmaster",
      "school_college_name",
      "address",
      "student_name",
      "admission_no_gr_no",
      "student_parent_name",
      "class_course_program",
      "academic_year_term",
      "signatory_user_id",
    ];

    const hasMissingFields = requiredFields.some(
      (field) => !form[field].trim(),
    );

    if (hasMissingFields) {
      toast.error("Please fill in all required fields");
      return;
    }

    createLetterMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border bg-card p-0 sm:max-w-3xl">
        <div className="space-y-6 p-6 sm:p-8">
          <DialogHeader className="mb-12 border-b pb-4 text-left">
            <DialogTitle className="text-2xl font-bold">
              Generate New Letter
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Fill in the required student and institute details to create a
              bank info letter entry.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="principal_headmaster">
                Principal/Headmaster <span className="text-destructive">*</span>
              </Label>
              <Input
                id="principal_headmaster"
                value={form.principal_headmaster}
                onChange={(event) =>
                  updateField("principal_headmaster", event.target.value)
                }
                placeholder="Enter principal or headmaster name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school_college_name">
                School/College Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="school_college_name"
                value={form.school_college_name}
                onChange={(event) =>
                  updateField("school_college_name", event.target.value)
                }
                placeholder="Enter school or college name"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">
                Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
                placeholder="Enter address"
                className="min-h-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student_name">
                Student Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="student_name"
                value={form.student_name}
                onChange={(event) =>
                  updateField("student_name", event.target.value)
                }
                placeholder="Enter student name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admission_no_gr_no">
                Admission No / GR No. <span className="text-destructive">*</span>
              </Label>
              <Input
                id="admission_no_gr_no"
                value={form.admission_no_gr_no}
                onChange={(event) =>
                  updateField("admission_no_gr_no", event.target.value)
                }
                placeholder="Enter admission or GR number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student_parent_name">
                Student Parent Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="student_parent_name"
                value={form.student_parent_name}
                onChange={(event) =>
                  updateField("student_parent_name", event.target.value)
                }
                placeholder="Enter parent name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class_course_program">
                Class / Course / Program{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="class_course_program"
                value={form.class_course_program}
                onChange={(event) =>
                  updateField("class_course_program", event.target.value)
                }
                placeholder="Enter class, course, or program"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="academic_year_term">
                Academic Year / Term <span className="text-destructive">*</span>
              </Label>
              <Input
                id="academic_year_term"
                value={form.academic_year_term}
                onChange={(event) =>
                  updateField("academic_year_term", event.target.value)
                }
                placeholder="Enter academic year or term"
              />
            </div>

            <div className="space-y-2">
              <Label>
                Signatory User <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.signatory_user_id}
                onValueChange={(value) => updateField("signatory_user_id", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isUsersLoading ? "Loading users..." : "Select signatory user"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {signatoryUsers.length === 0 ? (
                    <SelectItem value="no-users" disabled>
                      No users available
                    </SelectItem>
                  ) : (
                    signatoryUsers.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.full_name || user.username || `User ${user.id}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createLetterMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createLetterMutation.isPending}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {createLetterMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function BankInfoLetterPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewLetter, setPreviewLetter] = useState<BankInfoLetterRow | null>(null);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

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

  const { data, isLoading } = useQuery({
    queryKey: [
      ...BANK_INFO_LETTERS_QUERY_KEY,
      search,
      yearFilter,
      page,
      pageSize,
    ],
    queryFn: () =>
      searchBankInfoLetters({
        search,
        financialYear: yearFilter,
        page,
        pageSize,
      }),
  });

  const letters = data?.letters ?? [];
  const financialYears = data?.financialYears ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.page ?? page;

  const openContextMenuAt = (x: number, y: number, letter: BankInfoLetterRow) => {
    const clampedX = Math.min(x, window.innerWidth - 220);
    const clampedY = Math.min(y, window.innerHeight - 120);
    setContextMenu({ x: clampedX, y: clampedY, letter });
  };

  const handleContextMenu = (
    event: React.MouseEvent,
    letter: BankInfoLetterRow,
  ) => {
    event.preventDefault();
    openContextMenuAt(event.clientX, event.clientY, letter);
  };

  const handleActionClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    letter: BankInfoLetterRow,
  ) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    openContextMenuAt(rect.right - 180, rect.bottom + 8, letter);
  };

  const handleMenuAction = (action: string, letter: BankInfoLetterRow) => {
    if (action === "Open Letter") {
      setPreviewLetter(letter);
      closeContextMenu();
      return;
    }

    if (action === "Send via WhatsApp") {
      window.open(
        getBankInfoLetterWhatsAppURL({
          principal_headmaster: letter.principal_headmaster,
          school_college_name: letter.school_college_name,
          student_name: letter.student_name,
          admission_no_gr_no: letter.admission_no_gr_no,
          student_parent_name: letter.student_parent_name,
          class_course_program: letter.class_course_program,
          academic_year_term: letter.academic_year_term,
        }),
        "_blank",
        "noopener,noreferrer",
      );
      closeContextMenu();
      return;
    }

    toast(action + ` is not available yet for ${letter.student_name}`);
    closeContextMenu();
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
                <BreadcrumbPage>Bank Info Letter</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2 pr-4">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="gap-2 rounded-sm cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
          >
            <FilePlus2 className="h-4 w-4" />
            Generate New Letter
          </Button>
          <div className="flex items-center justify-center rounded-sm bg-blue-500 px-2 py-1">
            <AnimatedThemeToggler className="flex h-7 w-7 items-center justify-center text-white [&_svg]:h-4 [&_svg]:w-4" />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bank Info Letter</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage bank information letter entries and filter them by search or
            financial year.
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
                    <TableHead>Principal/Headmaster</TableHead>
                    <TableHead>School/College Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Admission No / GR No.</TableHead>
                    <TableHead>Student Parent Name</TableHead>
                    <TableHead>Class / Course / Program</TableHead>
                    <TableHead>Academic Year / Term</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {letters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                        No bank info letters found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    letters.map((letter) => (
                      <TableRow
                        key={letter.id}
                        className="cursor-context-menu select-none"
                        onContextMenu={(event) => handleContextMenu(event, letter)}
                      >
                        <TableCell>{letter.principal_headmaster}</TableCell>
                        <TableCell>{letter.school_college_name}</TableCell>
                        <TableCell className="max-w-xs whitespace-normal">
                          {letter.address}
                        </TableCell>
                        <TableCell>{letter.student_name}</TableCell>
                        <TableCell>{letter.admission_no_gr_no}</TableCell>
                        <TableCell>{letter.student_parent_name}</TableCell>
                        <TableCell>{letter.class_course_program}</TableCell>
                        <TableCell>{letter.academic_year_term}</TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => handleActionClick(event, letter)}
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
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-xs">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <CreateBankInfoLetterModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
      <BankLetterPreviewModal
        open={Boolean(previewLetter)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewLetter(null);
          }
        }}
        letter={previewLetter}
      />

      {contextMenu && (
        <div
          className="fixed z-50 min-w-[190px] overflow-hidden rounded-md border bg-popover text-sm text-popover-foreground shadow-md"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-accent"
            onClick={() =>
              handleMenuAction("Send via WhatsApp", contextMenu.letter)
            }
          >
            <MessageCircle className="h-4 w-4 text-green-600" />
            Send via Whats App
          </button>
          <div className="mx-2 h-px bg-border" />
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-accent"
            onClick={() => handleMenuAction("Open Letter", contextMenu.letter)}
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
            Open Letter
          </button>
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-accent"
            onClick={() =>
              handleMenuAction("Download Letter", contextMenu.letter)
            }
          >
            <Download className="h-4 w-4 text-muted-foreground" />
            Download Letter
          </button>
          <div className="mx-2 h-px bg-border" />
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-destructive transition-colors hover:bg-accent"
            onClick={() => handleMenuAction("Delete Letter", contextMenu.letter)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Letter
          </button>
        </div>
      )}
    </div>
  );
}
