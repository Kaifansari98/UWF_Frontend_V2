"use client";

import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import apiClient from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import FormSubmissionViewModal from "@/components/FormSubmissionViewModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function RejectedFormsPage() {
  const [rejectedForms, setRejectedForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [revertTarget, setRevertTarget] = useState<any | null>(null);

  const fetchRejectedForms = async () => {
    try {
      const res = await apiClient.get("/submissions/rejected");
  
      const transformed = res.data.rejectedSubmissions.map((item: any) => ({
        ...item,
        region: item.GeneratedForm.region,
      }));
  
      setRejectedForms(transformed);
    } catch (err) {
      console.error("Failed to fetch rejected forms", err);
      toast.error("Failed to load rejected forms");
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

  const columnDefs: ColDef[] = [
    {
      headerName: "Actions",
      pinned: "left",
      width: 240,
      cellRenderer: (params: any) => (
        <div className="flex gap-2 items-center h-full">
          <Button
            size="sm"
            className="bg-blue-500 text-white"
            onClick={() => {
              setSelectedSubmission(params.data);
              setShowViewModal(true);
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            className="bg-green-500 text-white"
            onClick={() => {
              setRevertTarget(params.data);
              setShowConfirmModal(true);
            }}
          >
            Revert Rejection
          </Button>
        </div>
      ),
    },
    { field: "formId", headerName: "Form ID", sortable: true, filter: true },
    {
      headerName: "Student Name",
      filter: true,
      valueGetter: (params: any) =>
        `${params.data.firstName || ""} ${params.data.fatherName || ""} ${params.data.familyName || ""}`,
    },
    { field: "region", headerName: "Region", filter: true },
    {
      field: "submitted_at",
      filter: true,
      headerName: "Submitted At",
      valueFormatter: (params: any) =>
        new Date(params.value).toLocaleString(),
    },
  ];

  return (
    <div className="px-6 pt-4 w-full h-full pb-16">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Requests rejected</h1>

      {loading ? (
        <p className="text-gray-600">Loading rejected forms...</p>
      ) : (
        <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
          <AgGridReact
            rowData={rejectedForms}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
            suppressCellFocus={true}
          />
        </div>
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
