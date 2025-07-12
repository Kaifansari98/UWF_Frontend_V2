"use client";

import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { Button } from "@/components/ui/button";
import apiClient from "@/utils/apiClient";
import FormSubmissionViewModal from "@/components/FormSubmissionViewModal";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";
import { pdf } from "@react-pdf/renderer";
import BankDetailsPDF from "@/components/pdf/BankDetailsPDF";

export default function DisbursedFormsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null); 
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [submissionToRevert, setSubmissionToRevert] = useState<any | null>(null);

  const [showCaseCloseModal, setShowCaseCloseModal] = useState(false);
  const [submissionToClose, setSubmissionToClose] = useState<any | null>(null);

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

  const handleCaseClose = async () => {
    if (!submissionToClose) return;
  
    try {
      const res = await apiClient.put(`/submissions/close-case/${submissionToClose.formId}`);
      toast.success(res.data.message || "Form marked as case closed");
      fetchDisbursedForms();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to mark form as case closed"
      );
    } finally {
      setShowCaseCloseModal(false);
      setSubmissionToClose(null);
    }
  };  

  useEffect(() => {
    fetchDisbursedForms();
  }, []);

  const columnDefs: ColDef[] = [
    {
      headerName: "Actions",
      pinned: "left",
      width: 420,
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
              setSubmissionToClose(params.data);
              setShowCaseCloseModal(true);
            }}
          >
           Amount Disbursed
          </Button>
          <Button
            size="sm"
            className="bg-yellow-500 text-white"
            onClick={async () => {
              const blob = await pdf(<BankDetailsPDF submission={params.data} />).toBlob();
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `${params.data.formId}_BankDetails.pdf`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download
          </Button>
          <Button
            size="sm"
            className="bg-red-500 text-white"
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
      filter: true,
      valueGetter: (params: any) =>
        `${params.data.firstName || ""} ${params.data.fatherName || ""} ${params.data.familyName || ""}`,
    },
    {
      field: "acceptedAmount",
      headerName: "Accepted Amount",
      filter: true,
      valueGetter: (params: any) => `₹ ${params.data.acceptedAmount || 0}`,
    },
    { field: "bankAccountHolder", headerName: "Account Holder Name", filter: true },
    { field: "bankAccountNumber", headerName: "Bank Account No.", filter: true },
    { field: "ifscCode", headerName: "IFSC Code", filter: true },
    { field: "bankName", headerName: "Bank Name", filter: true },
  ];

  return (
    <div className="px-6 pt-4 w-full h-full pb-16">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Aid Disbursement</h1>

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

      {showCaseCloseModal && submissionToClose && (
        <ConfirmModal
          title="Mark Case as Closed"
          description={`Are you sure you want to close request ${submissionToClose.formId}?`}
          confirmText="Yes, Close Case"
          cancelText="Cancel"
          onConfirm={handleCaseClose}
          onCancel={() => {
            setShowCaseCloseModal(false);
            setSubmissionToClose(null);
          }}
        />
      )}
    </div>
  );
}
