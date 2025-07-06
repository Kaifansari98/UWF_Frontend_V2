"use client";

import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import apiClient from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/ConfirmModal";
import FormSubmissionViewModal from "@/components/FormSubmissionViewModal";
import toast from "react-hot-toast";
import { getAcceptanceWhatsAppURL } from "@/utils/shareUtils";

export default function AcceptedFormsPage() {
  const [acceptedSubmissions, setAcceptedSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [submissionToAccept, setSubmissionToAccept] = useState<any | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [submissionToRevert, setSubmissionToRevert] = useState<any | null>(null);
  const [showRevertModal, setShowRevertModal] = useState(false);

  const fetchAcceptedForms = async () => {
    try {
      const res = await apiClient.get("/submissions/accepted");
      const transformed = res.data.acceptedSubmissions.map((item: any) => ({
        ...item,
        region: item.GeneratedForm.region,
      }));
      setAcceptedSubmissions(transformed);
    } catch (err) {
      console.error("Error fetching accepted forms", err);
      toast.error("Failed to load accepted forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcceptedForms();
  }, []);

  const handleAccept = async () => {
    if (!submissionToAccept) return;
    try {
      await apiClient.put(`/submissions/accept/${submissionToAccept.formId}`);
      toast.success("Form accepted successfully");
      const waLink = getAcceptanceWhatsAppURL(submissionToAccept.mobile);
      window.open(waLink, "_blank");
      fetchAcceptedForms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept form");
    } finally {
      setShowAcceptModal(false);
      setSubmissionToAccept(null);
    }
  };

  const handleRevertAcceptance = async () => {
    if (!submissionToRevert) return;
    try {
      await apiClient.put(`/submissions/revert-accept/${submissionToRevert.formId}`);
      toast.success("Form reverted to 'submitted'");
      fetchAcceptedForms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to revert acceptance");
    } finally {
      setShowRevertModal(false);
      setSubmissionToRevert(null);
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: "Actions",
      pinned: "left",
      width: 450,
      cellRenderer: (params: any) => (
        <div className="flex gap-2 items-center">
          <Button
            size="sm"
            className="bg-[#025aa5] text-white"
            onClick={() => {
              setSelectedSubmission(params.data);
              setShowViewModal(true);
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            className="bg-green-600 text-white"
            onClick={() => {
              setSubmissionToAccept(params.data);
              setShowAcceptModal(true);
            }}
          >
            Accept
          </Button>
          <Button
            size="sm"
            className="bg-red-600 text-white"
            // Intentionally left blank – no functionality
            onClick={() => {}}
          >
            Reject
          </Button>
          <Button
            size="sm"
            className="bg-yellow-600 text-white"
            onClick={() => {
              setSubmissionToRevert(params.data);
              setShowRevertModal(true);
            }}
          >
            Revert Acceptance
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
    { field: "mobile", headerName: "Mobile" },
    { field: "coordinatorName", headerName: "UWF Member" },
    { field: "region", headerName: "Region" },
  ];

  return (
    <div className="px-6 pt-4 w-full h-full pb-16">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Accepted Forms</h1>

      {loading ? (
        <p>Loading accepted forms...</p>
      ) : (
        <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
          <AgGridReact
            rowData={acceptedSubmissions}
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

      {showAcceptModal && submissionToAccept && (
        <ConfirmModal
          title="Accept Form"
          description={`Confirm accepting form ${submissionToAccept.formId}?`}
          confirmText="Accept"
          cancelText="Cancel"
          onConfirm={handleAccept}
          onCancel={() => {
            setShowAcceptModal(false);
            setSubmissionToAccept(null);
          }}
        />
      )}

      {showRevertModal && submissionToRevert && (
        <ConfirmModal
          title="Revert Accepted Form"
          description={`Are you sure you want to revert acceptance of form ${submissionToRevert.formId}?`}
          confirmText="Revert"
          cancelText="Cancel"
          onConfirm={handleRevertAcceptance}
          onCancel={() => {
            setShowRevertModal(false);
            setSubmissionToRevert(null);
          }}
        />
      )}
    </div>
  );
}
