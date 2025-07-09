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
import { getRejectionWhatsAppURL, getClarificationWhatsAppURL, getAcceptanceWhatsAppURL } from "@/utils/shareUtils";

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
  const [submissionToAccept, setSubmissionToAccept] = useState<any | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  const handleEdit = (submission: any) => {
    console.log("Edit clicked for:", submission.formId);
  };
  
  const handleAcceptClick = (submission: any) => {
    setSubmissionToAccept(submission);
    setShowAcceptModal(true);
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
  
      await fetchSubmittedForms();
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
  
      await fetchSubmittedForms();
  
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

  const confirmAccept = async () => {
    if (!submissionToAccept) return;
  
    try {
      const res = await apiClient.put(`/submissions/accept/${submissionToAccept.formId}`);
      toast.success(res.data.message || "Form accepted successfully");
  
      await fetchSubmittedForms();
  
      const whatsappURL = getAcceptanceWhatsAppURL(submissionToAccept.mobile);
      window.open(whatsappURL, "_blank");
  
    } catch (err: any) {
      console.error("Accept failed", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to accept form");
    } finally {
      setShowAcceptModal(false);
      setSubmissionToAccept(null);
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
            className="bg-yellow-500 text-white"
            onClick={() => {
              setSelectedSubmission(params.data);
              setShowEditModal(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            className="bg-green-500 text-white"
            onClick={() => handleAcceptClick(params.data)}
          >
            Accept
          </Button>
          <Button
            size="sm"
            className="bg-red-500 text-white"
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
      filter: true,
      valueGetter: (params: any) =>
        `${params.data.firstName || ""} ${params.data.fatherName || ""} ${params.data.familyName || ""}`,
    },
    {
      field: "mobile",
      headerName: "Mobile",
      filter: true,
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
      filter: true,
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
      filter: true,
      valueFormatter: (params: any) =>
        new Date(params.value).toLocaleString(),
    },
    {
      field: "coordinatorName",
      headerName: "UWF Member",
      filter: true,
    },
    { field: "coordinatorMobile", headerName: "UWF Mobile", filter: true },
    {
      field: "region",
      headerName: "Region",
      filter: true,
    },
  ];  

  const fetchSubmittedForms = async () => {
    setLoading(true); // Optional: shows loading while refreshing
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
  
  useEffect(() => {
    fetchSubmittedForms();
  }, []);

  return (
    <div className="px-6 pt-4 w-full h-full pb-16">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Submitted Forms</h1>

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

{showAcceptModal && submissionToAccept && (
  <ConfirmModal
    title="Accept Form Submission"
    description={`Are you sure you want to accept form ${submissionToAccept.formId}?`}
    confirmText="Accept"
    cancelText="Cancel"
    onConfirm={confirmAccept}
    onCancel={() => {
      setShowAcceptModal(false);
      setSubmissionToAccept(null);
    }}
  />
)}

    </div>  
  );
}
