"use client";

import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import apiClient from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import FormSubmissionViewModal from "@/components/FormSubmissionViewModal";

export default function SubmittedFormsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  const columnDefs: ColDef[] = [
    {
      headerName: "Action",
      pinned: "right", // ✅ RIGHT SIDE (not scrollable)
      width: 100,
      cellRenderer: (params: any) => (
        <Button
          size="sm"
          className="bg-blue-600 text-white"
          onClick={() => setSelectedSubmission(params.data)}
        >
          View
        </Button>
      ),
    },
    { field: "formId", headerName: "Form ID", sortable: true, filter: true },
    {
      headerName: "Student Name",
      valueGetter: (params: any) =>
        `${params.data.firstName || ""} ${params.data.fatherName || ""} ${params.data.familyName || ""}`,
    },
    {
      field: "mobile",
      headerName: "Mobile",
      cellRenderer: (params: any) =>
        params.value ? (
          <a
            href={`https://wa.me/+91${params.value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 underline"
          >
            {params.value}
          </a>
        ) : null,
    },
    {
      field: "alternateMobile",
      headerName: "Alt Mobile",
      cellRenderer: (params: any) =>
        params.value ? (
          <a
            href={`https://wa.me/+91${params.value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 underline"
          >
            {params.value}
          </a>
        ) : null,
    },
    {
      field: "submitted_at",
      headerName: "Submitted At",
      valueFormatter: (params: any) =>
        new Date(params.value).toLocaleString(),
    },
    {
      field: "coordinatorName",
      headerName: "UWF Member",
    },
    { field: "coordinatorMobile", headerName: "UWF Mobile" },
    {
      field: "region",
      headerName: "Region",
    },
  ];  

  useEffect(() => {
    const fetchSubmittedForms = async () => {
      try {
        const res = await apiClient.get("/submissions/submitted");
        const transformed = res.data.submissions.map((item: any) => ({
          ...item,
          region: item.GeneratedForm.region,
        }));
        setSubmissions(transformed);
      } catch (err) {
        console.error("Error fetching submissions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmittedForms();
  }, []);

  return (
    <div className="px-6 pt-4 w-full h-full pb-16">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Submitted Forms</h1>

      {loading ? (
        <p className="text-gray-600">Loading submitted forms...</p>
      ) : (
        <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
          <AgGridReact
            rowData={submissions}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
            suppressCellFocus={true}
          />
        </div>
      )}

      {selectedSubmission && (
        <FormSubmissionViewModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
}
