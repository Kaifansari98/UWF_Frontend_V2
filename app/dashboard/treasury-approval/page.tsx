// app/(dashboard)/InProgressRequests/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { Button } from "@/components/ui/button";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import FormSubmissionViewModal from "@/components/FormSubmissionViewModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function InProgressRequests() {
  const [inProgressSubmissions, setInProgressSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [submissionToReject, setSubmissionToReject] = useState<any | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [submissionToDisburse, setSubmissionToDisburse] = useState<any | null>(null);
  const [showDisburseModal, setShowDisburseModal] = useState(false);

  const fetchInProgressForms = async () => {
    try {
      const res = await apiClient.get("/submissions/payment-in-progress");
      console.log("res.data:", res.data);
  
      const transformed = res.data.paymentInProgress.map((item: any) => ({
        ...item,
        region: item.GeneratedForm?.region,
      }));
      setInProgressSubmissions(transformed);
    } catch (err) {
      console.error("Error fetching in-progress forms", err);
      toast.error("Failed to load forms");
    } finally {
      setLoading(false);
    }
  };  

  const handleRevertTreasury = async () => {
    if (!submissionToReject) return;
    try {
      const res = await apiClient.put(`/submissions/revert-treasury/${submissionToReject.formId}`);
      toast.success(res.data.message || "Treasury approval reverted");
      fetchInProgressForms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to revert treasury approval");
    } finally {
      setShowRejectModal(false);
      setSubmissionToReject(null);
    }
  };

  const handleDisburseForm = async () => {
    if (!submissionToDisburse) return;
    try {
      const res = await apiClient.put(`/submissions/disburse/${submissionToDisburse.formId}`);
      toast.success(res.data.message || "Form marked as disbursed");
      fetchInProgressForms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to disburse form");
    } finally {
      setShowDisburseModal(false);
      setSubmissionToDisburse(null);
    }
  };  

  useEffect(() => {
    fetchInProgressForms();
  }, []);

  const columnDefs: ColDef[] = [
    {
      headerName: "Actions",
      pinned: "left",
      width: 280,
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
              setSubmissionToDisburse(params.data);
              setShowDisburseModal(true);
            }}
          >
            Accept
          </Button>
          <Button
            size="sm"
            className="bg-red-500 text-white"
            onClick={() => {
              setSubmissionToReject(params.data);
              setShowRejectModal(true);
            }}
          >
            Revert Back
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
    { field: "requested_amount", headerName: "Requested Amount", filter: true },
    { field: "acceptedAmount", headerName: "Approved Amount", filter: true },
    { field: "mobile", headerName: "Mobile Number", filter: true },
    { field: "alternateMobile", headerName: "Alternate Number", filter: true },
    {
      field: "submitted_at",
      headerName: "Submitted At",
      filter: true,
      valueFormatter: (params: any) =>
        new Date(params.value).toLocaleString(),
    },
    { field: "coordinatorName", headerName: "UWF Member", filter: true },
    { field: "coordinatorMobile", headerName: "UWF Mobile", filter: true },
    { field: "region", headerName: "Region", filter: true },
  ];

  return (
    <div className="px-6 pt-4 w-full h-full pb-16">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Treasury Approval</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
          <AgGridReact
            rowData={inProgressSubmissions}
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

{showRejectModal && submissionToReject && (
  <ConfirmModal
    title="Revert Treasury Approved Form"
    description={`Are you sure you want to revert treasury approval for form ${submissionToReject.formId}?`}
    confirmText="Revert Back"
    cancelText="Cancel"
    onConfirm={handleRevertTreasury}
    onCancel={() => {
      setShowRejectModal(false);
      setSubmissionToReject(null);
    }}
  />
)}

{showDisburseModal && submissionToDisburse && (
  <ConfirmModal
    title="Treasury Approval"
    description={`Are you sure you want to mark form ${submissionToDisburse.formId} for Final Approval?`}
    confirmText="Approve"
    cancelText="Cancel"
    onConfirm={handleDisburseForm}
    onCancel={() => {
      setShowDisburseModal(false);
      setSubmissionToDisburse(null);
    }}
  />
)}

    </div>
  );
}
