"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchPendingForms } from "@/features/forms/pendingFormsSlice";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { Mail, MessageCircle, Trash2 } from "lucide-react";
import { getWhatsAppShareURL, getGmailShareURL } from "@/utils/shareUtils";
import { deleteFormById } from "@/features/forms/pendingFormsSlice";
import ConfirmModal from "@/components/ConfirmModal";
import toast from "react-hot-toast";

export default function PendingFormsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { forms, loading } = useSelector((state: RootState) => state.pendingForms);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formIdToDelete, setFormIdToDelete] = useState<string | null>(null);

  useEffect(() => { 
    dispatch(fetchPendingForms());
  }, [dispatch]);

  const columnDefs: ColDef[] = [
    { field: "id", headerName: "ID", sortable: true, filter: true },
    { field: "formId", headerName: "Form ID", sortable: true, filter: true },
    { field: "student_name", headerName: "Student Name", sortable: true, filter: true }, // ✅ NEW
    { field: "region", sortable: true, filter: true },
    {
      field: "form_link",
      headerName: "Form Link",
      cellRenderer: (params: any) => (
        <a href={params.value} target="_blank" className="text-blue-600 underline">
          {params.value}
        </a>
      )
    },
    { field: "creator_name", headerName: "Created By", sortable: true, filter: true },
    {
      field: "created_on",
      headerName: "Created On",
      valueFormatter: (params: any) =>
        new Date(params.value).toLocaleDateString(),
    },
    {
      headerName: "Actions",
      cellRenderer: (params: any) => {
        const formLink = params.data.form_link;
        const formId = params.data.formId;
  
        return (
          <div className="flex gap-3 items-center justify-center h-full">
            <button
              onClick={() => window.open(getWhatsAppShareURL(formLink), "_blank")}
              title="WhatsApp"
            >
              <MessageCircle size={18} className="text-green-600" />
            </button>
            <button
              onClick={() => window.open(getGmailShareURL(formLink), "_blank")}
              title="Email"
            >
              <Mail size={18} className="text-zinc-900" />
            </button>
            <button
              onClick={() => {
                setFormIdToDelete(formId);
                setShowDeleteModal(true);
              }}
              title="Delete"
            >
              <Trash2 size={18} className="text-red-500" />
            </button>
          </div>
        );
      },
    }
  ];  

  return (
    <div className="px-6 pt-4 w-full h-full pb-16">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Pending Forms</h1>

      {loading ? (
        <p className="text-gray-600">Loading pending forms...</p>
      ) : (
        <div className="ag-theme-alpine" style={{ height: '100%', width: "100%" }}>
          <AgGridReact
            rowData={forms}
            columnDefs={columnDefs}
            pagination={true}
          />
        </div>
      )}
      {showDeleteModal && formIdToDelete && (
        <ConfirmModal
          title="Delete Form"
          description={`Are you sure you want to delete form "${formIdToDelete}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={async () => {
            await dispatch(deleteFormById(formIdToDelete));
            toast.success(`Form ${formIdToDelete} deleted successfully!`);
            setShowDeleteModal(false);
            setFormIdToDelete(null);
          }}
          onCancel={() => {
            setShowDeleteModal(false);
            setFormIdToDelete(null);
          }}
        />
      )}
    </div>
  );
}
