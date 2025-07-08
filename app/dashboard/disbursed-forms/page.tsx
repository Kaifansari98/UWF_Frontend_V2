"use client";

import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { Button } from "@/components/ui/button";
import apiClient from "@/utils/apiClient";
import FormSubmissionViewModal from "@/components/FormSubmissionViewModal";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function DisbursedFormsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null); 
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [submissionToRevert, setSubmissionToRevert] = useState<any | null>(null);

  const fetchDisbursedForms = async () => {
    try {
      const res = await apiClient.get("/submissions/disbursed/all");
      const transformed = res.data.disbursedForms.map((item: any) => ({
        ...item,
        region: item.GeneratedForm?.region,
      }));
      setSubmissions(transformed);
    } catch (err) {
      console.error("Failed to load disbursed forms", err);
      toast.error("Failed to load disbursed forms");
    } finally {
      setLoading(false);
    }
  };

  const handleRevertBack = async () => {
    if (!submissionToRevert) return;

    try {
      const res = await apiClient.put(
        `/submissions/revertDisbursementStatus/${submissionToRevert.formId}`
      );
      toast.success(res.data.message || "Disbursement reverted successfully");
      fetchDisbursedForms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to revert disbursement");
    } finally {
      setShowRevertModal(false);
      setSubmissionToRevert(null);
    }
  };

  useEffect(() => {
    fetchDisbursedForms();
  }, []);

  const columnDefs: ColDef[] = [
    {
      headerName: "Actions",
      pinned: "left",
      width: 550,
      cellRenderer: (params: any) => (
        <div className="flex gap-2 items-center">
          <Button
            size="sm"
            className="bg-blue-600 text-white"
            onClick={() => {
              setSelectedSubmission(params.data);
              setShowViewModal(true);
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            className="bg-yellow-600 text-white"
            onClick={() => {
              console.log("Case Closure for", params.data.formId);
              toast("Case Closure action (not implemented yet)");
            }}
          >
            Case Closure
          </Button>
          <Button
            size="sm"
            className="bg-green-600 text-white"
            onClick={() => {
              console.log("Download PDF for", params.data.formId);
              toast("Download action (not implemented yet)");
            }}
          >
            Download
          </Button>
          <Button
            size="sm"
            className="bg-red-600 text-white"
            onClick={() => {
              setSubmissionToRevert(params.data);
              setShowRevertModal(true);
            }}
          >
            Revert
          </Button>
        </div>
      ),
    },
    { field: "formId", headerName: "Form ID", sortable: true, filter: true },
    {
      headerName: "Student Name",
      valueGetter: (params: any) =>
        `${params.data.firstName || ""} ${params.data.fatherName || ""} ${params.data.familyName || ""}`,
    },
    {
      field: "acceptedAmount",
      headerName: "Accepted Amount",
      valueGetter: (params: any) => `₹ ${params.data.acceptedAmount || 0}`,
    },
    { field: "bankAccountHolder", headerName: "Account Holder Name" },
    { field: "bankAccountNumber", headerName: "Bank Account No." },
    { field: "ifscCode", headerName: "IFSC Code" },
    { field: "bankName", headerName: "Bank Name" },
  ];

  return (
    <div className="px-6 pt-4 w-full h-full pb-16">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Disbursed Forms</h1>

      {loading ? (
        <p>Loading...</p>
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
    </div>
  );
}
