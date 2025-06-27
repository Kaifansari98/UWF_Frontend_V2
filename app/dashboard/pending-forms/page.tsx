"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchPendingForms } from "@/features/forms/pendingFormsSlice";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";

export default function PendingFormsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { forms, loading } = useSelector((state: RootState) => state.pendingForms);

  useEffect(() => {
    dispatch(fetchPendingForms());
  }, [dispatch]);

  const columnDefs: ColDef[] = [
    { field: "id", headerName: "ID", sortable: true, filter: true },
    { field: "formId", headerName: "Form ID", sortable: true, filter: true },
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
  ];

  return (
    <div className="px-6 pt-4 w-full h-full pb-16">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Pending Forms</h1>

      {loading ? (
        <p className="text-gray-600">Loading pending forms...</p>
      ) : (
        <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
          <AgGridReact
            rowData={forms}
            columnDefs={columnDefs}
            pagination={true}
          />
        </div>
      )}
    </div>
  );
}
