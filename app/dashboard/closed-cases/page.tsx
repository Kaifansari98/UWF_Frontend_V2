"use client";

import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { Button } from "@/components/ui/button";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";
import FormSubmissionViewModal from "@/components/FormSubmissionViewModal";
import { Download } from "lucide-react";
import { exportClosedFormsToExcel } from "@/utils/exportClosedFormsToExcel";
import { exportCurrentYearClosedFormsToExcel } from "@/utils/exportCurrentYearClosedFormsToExcel";


export default function ClosedFormsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [submissionToRevert, setSubmissionToRevert] = useState<any | null>(null);

  const fetchClosedForms = async () => {
    try {
      const res = await apiClient.get("/submissions/case-closed");
      const transformed = res.data.caseClosedForms.map((item: any) => ({
        ...item,
        region: item.GeneratedForm?.region,
      }));
      setSubmissions(transformed);
    } catch (err) {
      console.error("Failed to load closed forms", err);
      toast.error("Failed to load closed forms");
    } finally {
      setLoading(false);
    }
  };

  const handleRevertToDisbursement = async () => {
    if (!submissionToRevert) return;

    try {
      const res = await apiClient.put(
        `/submissions/revert-case-closed/${submissionToRevert.formId}`
      );
      toast.success(res.data.message || "Reverted to disbursement");
      fetchClosedForms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to revert to disbursement");
    } finally {
      setShowRevertModal(false);
      setSubmissionToRevert(null);
    }
  };

  useEffect(() => {
    fetchClosedForms();
  }, []);

  const columnDefs: ColDef[] = [
    {
      headerName: "Actions",
      pinned: "left",
      width: 190,
      cellRenderer: (params: any) => (
        <div className="flex gap-2 items-center h-full">
          <Button
            size="sm"
            className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => {
              setSelectedSubmission(params.data);
              setShowViewModal(true);
            }}
          >
            View
          </Button>
          {/* <Button
            size="sm"
            className="bg-orange-500 text-white hover:bg-orange-600"
            onClick={() => {
              setSubmissionToRevert(params.data);
              setShowRevertModal(true);
            }}
          >
            Revert to Disbursement
          </Button> */}
          <Button size="sm" className="bg-yellow-500 text-white hover:bg-yellow-600" onClick={() => toast("Download coming soon!")}>
            Download
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
    { field: "mobile", headerName: "Mobile Number", filter: true },
    { field: "alternateMobile", headerName: "Alt. Mobile Number", filter: true },
    { field: "coordinatorName", headerName: "UWF Member", filter: true },
    { field: "coordinatorMobile", headerName: "UWF Member Mobile", filter: true },
    { field: "region", headerName: "Region", filter: true },
  ];

  return (
    <div className="px-6 pt-4 w-full h-full pb-16">

<div className="flex items-center justify-between mb-4 flex-wrap gap-4">
  <h1 className="text-2xl font-bold text-gray-800">Closed Cases</h1>
  <div className="flex gap-2">
    <Button
      className="bg-green-500 text-white flex items-center gap-2 hover:bg-green-600"
      onClick={async () => {
        try {
          await exportClosedFormsToExcel();
          toast.success("Excel file downloaded");
        } catch {
          toast.error("Failed to download Excel file, No Closed Cases Found");
        }
      }}
    >
      <Download className="w-4 h-4" />
      Download ExcelSheet
    </Button>

    <Button
      className="bg-blue-500 text-white flex items-center gap-2 hover:bg-blue-600"
      onClick={async () => {
        try {
          await exportCurrentYearClosedFormsToExcel();
          toast.success(`Excel file for ${new Date().getFullYear()} downloaded`);
        } catch {
          toast.error("Failed to download Excel file for current year");
        }
      }}
    >
      <Download className="w-4 h-4" />
      Case Closed {new Date().getFullYear()}
    </Button>
  </div>
</div>



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
          title="Revert to Disbursement"
          description={`Are you sure you want to revert form ${submissionToRevert.formId} to disbursement status?`}
          confirmText="Revert"
          cancelText="Cancel"
          onConfirm={handleRevertToDisbursement}
          onCancel={() => {
            setShowRevertModal(false);
            setSubmissionToRevert(null);
          }}
        />
      )}
    </div>
  );
}
