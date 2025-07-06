"use client";

import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import apiClient from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import FormSubmissionViewModal from "@/components/FormSubmissionViewModal";
import ConfirmModal from "@/components/ConfirmModal";
import toast from "react-hot-toast";
import EditFormModal from "@/components/EditFormModal";
import { getRejectionWhatsAppURL, getClarificationWhatsAppURL } from "@/utils/shareUtils";

export default function SubmittedFormsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<any | null>(null);
  const [submissionToReject, setSubmissionToReject] = useState<any | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleEdit = (submission: any) => {
    console.log("Edit clicked for:", submission.formId);
  };
  
  const handleAccept = (submission: any) => {
    console.log("Accept clicked for:", submission.formId);
  };

  const handleRejectClick = (submission: any) => {
    setSubmissionToReject(submission);
    setShowRejectModal(true);
  };  
  
  const handleDeleteClick = (submission: any) => {
    setSubmissionToDelete(submission);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!submissionToDelete) return;
  
    try {
      const res = await apiClient.delete("/submissions/delete", {
        data: { formId: submissionToDelete.formId },
      });
  
      toast.success(res.data.message || "Form deleted successfully");
  
      setSubmissions((prev) =>
        prev.filter((item) => item.formId !== submissionToDelete.formId)
      );
    } catch (err: any) {
      console.error("Delete failed", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to delete form");
    } finally {
      setShowDeleteModal(false);
      setSubmissionToDelete(null);
    }
  };  

  const confirmReject = async () => {
    if (!submissionToReject) return;
  
    try {
      const res = await apiClient.put(`/submissions/reject/${submissionToReject.formId}`);
      toast.success(res.data.message || "Form rejected successfully");
  
      setSubmissions((prev) =>
        prev.map((item) =>
          item.formId === submissionToReject.formId
            ? {
                ...item,
                isRejected: true,
                status: "rejected",
                GeneratedForm: {
                  ...item.GeneratedForm,
                  status: "rejected",
                },
              }
            : item
        )
      );
  
      const whatsappURL = getRejectionWhatsAppURL(submissionToReject.mobile);
      window.open(whatsappURL, "_blank");
  
    } catch (err: any) {
      console.error("Reject failed", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to reject form");
    } finally {
      setShowRejectModal(false);
      setSubmissionToReject(null);
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: "Action",
      pinned: "left",
      width: 370,
      cellRenderer: (params: any) => (
        <div className="flex gap-2 h-full items-center">
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
            className="bg-yellow-600 text-white"
            onClick={() => {
              setSelectedSubmission(params.data);
              setShowEditModal(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            className="bg-green-600 text-white"
            onClick={() => console.log("Accept clicked", params.data)}
          >
            Accept
          </Button>
          <Button
            size="sm"
            className="bg-red-600 text-white"
            onClick={() => handleDeleteClick(params.data)}
          >
            Delete
          </Button>
          <Button
            size="sm"
            className="bg-gray-700 text-white"
            onClick={() => handleRejectClick(params.data)}
          >
            Reject
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
      field: "mobile",
      headerName: "Mobile",
      cellRenderer: (params: any) =>
        params.value ? (
          <a
            href={getClarificationWhatsAppURL(params.value)}
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
            href={getClarificationWhatsAppURL(params.value)}
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
        toast.error("Failed to load submissions");
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

      {/* {selectedSubmission && (
        <FormSubmissionViewModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )} */}

      {showDeleteModal && submissionToDelete && (
      <ConfirmModal
      title="Delete Form Submission"
      description={`Are you sure you want to delete form ${submissionToDelete.formId}? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={confirmDelete}
      onCancel={() => {
        setShowDeleteModal(false);
        setSubmissionToDelete(null);
      }}
  />
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

{showEditModal && selectedSubmission && (
  <EditFormModal
    submission={selectedSubmission}
    onClose={() => {
      setShowEditModal(false);
      setSelectedSubmission(null);
    }}
    onUpdateSuccess={() => {
      setShowEditModal(false);
      setSelectedSubmission(null);
      // Optionally refresh data
    }}
  />
)}

{showRejectModal && submissionToReject && (
  <ConfirmModal
    title="Reject Form Submission"
    description={`Are you sure you want to reject form ${submissionToReject.formId}?`}
    confirmText="Reject"
    cancelText="Cancel"
    onConfirm={confirmReject}
    onCancel={() => {
      setShowRejectModal(false);
      setSubmissionToReject(null);
    }}
  />
)}
    </div>  
  );
}
