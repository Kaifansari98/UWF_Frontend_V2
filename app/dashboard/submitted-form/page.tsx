"use client";

import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { Button } from "@/components/ui/button";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import FormSubmissionViewModal from "@/components/FormSubmissionViewModal";

export default function SubmittedAcknowledgementPage() {
  const [ackForms, setAckForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const fetchSubmittedAcknowledgements = async () => {
    try {
      const res = await apiClient.get("/acknowledgement/submitted");
      setAckForms(res.data.data);
    } catch (err) {
      toast.error("Failed to load submitted acknowledgements");
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmittedAcknowledgements();
  }, []);

  const handleAccept = async (formId: string) => {
    try {
      await apiClient.put(`/acknowledgement/accept/${formId}`);
      toast.success("Acknowledgement accepted and case closed.");
      fetchSubmittedAcknowledgements();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to accept acknowledgement.";
      toast.error(message);
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: "Actions",
      pinned: "left",
      width: 170,
      cellRenderer: (params: any) => {
        const submission = params.data?.formSubmission;
        const formId = params.data?.formId;

        return (
          <div className="flex gap-2 items-center h-full">
            <Button
              size="sm"
              className="bg-blue-500 text-white"
              onClick={() => {
                setSelectedSubmission({
                  ...submission,
                  acknowledgement: params.data.acknowledgement,
                });                
                setShowViewModal(true);
              }}
            >
              View
            </Button>
            <Button
              size="sm"
              className="bg-green-500 text-white"
              onClick={() => handleAccept(formId)}
            >
              Accept
            </Button>
          </div>
        );
      },
    },
    { field: "formId", headerName: "Form ID", filter: true },
    {
      headerName: "Student Name",
      field: "formSubmission.firstName",
      valueGetter: (params: any) => {
        const s = params.data.formSubmission;
        return `${s.firstName || ""} ${s.fatherName || ""} ${s.familyName || ""}`;
      },
    },
    { field: "acknowledgement.status", headerName: "Status", filter: true },
    { field: "formSubmission.mobile", headerName: "Mobile", filter: true },
    { field: "formSubmission.class", headerName: "Class", filter: true },
    { field: "formSubmission.coordinatorName", headerName: "UWF Member Name", filter: true },
    { field: "formSubmission.coordinatorMobile", headerName: "UWF Member Contact", filter: true },
    { field: "formSubmission.academicYear", headerName: "Academic Year", filter: true },
  ];

  return (
    <div className="px-6 pt-4 w-full h-full pb-16">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Submitted Acknowledgement Forms</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
          <AgGridReact
            rowData={ackForms}
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
    </div>
  );
}
