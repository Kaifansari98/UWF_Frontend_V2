"use client";

import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { Button } from "@/components/ui/button";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import FormSubmissionViewModal from "@/components/FormSubmissionViewModal";

export default function AcceptedAcknowledgementPage() {
  const [ackForms, setAckForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const fetchAcceptedAcknowledgements = async () => {
    try {
      const res = await apiClient.get("/acknowledgement/accepted");
      setAckForms(res.data.data);
    } catch (err) {
      toast.error("Failed to load accepted acknowledgements");
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcceptedAcknowledgements();
  }, []);

  const columnDefs: ColDef[] = [
    {
      headerName: "Actions",
      pinned: "left",
      width: 100,
      cellRenderer: (params: any) => {
        const submission = params.data?.formSubmission;
        return (
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
    {
      field: "acknowledgement.form_link",
      headerName: "Form Link",
      cellRenderer: (params: any) => {
        const link = params.value;
        return link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            View Form
          </a>
        ) : (
          "-"
        );
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
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Accepted Acknowledgement Forms</h1>

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
