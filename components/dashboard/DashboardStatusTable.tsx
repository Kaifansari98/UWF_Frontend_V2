"use client";

import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import apiClient from "@/utils/apiClient";
import { ICellRendererParams } from "ag-grid-community";

type Form = {
  formId: string;
  student_name: string;
  status: string;
  form_link: string;
  created_on: string;
};

export default function DashboardStatusTable() {
  const [rowData, setRowData] = useState<Form[]>([]);

  const columnDefs: ColDef[] = [
    { headerName: "FORM ID", field: "formId", flex: 1, filter: 'true' },
    { headerName: "STUDENT NAME", field: "student_name", flex: 1, filter: 'true' },
    { headerName: "STATUS", field: "status", flex: 1, filter: 'true' },
    {
      headerName: "FORM LINK",
      field: "form_link",
      flex: 1.5,
      filter: 'true',
      cellRenderer: (params: ICellRendererParams) => (
        <a href={params.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          {params.value}
        </a>
      ),
    },
    {
      headerName: "CREATED AT",
      field: "created_on",
      flex: 1.2,
      filter: 'true',
      valueFormatter: (params: { value: string }) =>
        new Date(params.value).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await apiClient.get("/forms/all");
        const currentYear = new Date().getFullYear();
  
        const filteredForms = (res.data.forms || []).filter((form: Form) => {
          const createdYear = new Date(form.created_on).getFullYear();
          return createdYear === currentYear;
        });
  
        setRowData(filteredForms);
      } catch (error) {
        console.error("Failed to fetch forms:", error);
      }
    };
  
    fetchForms();
  }, []);
  

  return (
    <div className="ag-theme-alpine w-full h-[600px] rounded-xl overflow-hidden">
        <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            suppressCellFocus
            domLayout="normal" // ❗ Change from 'autoHeight' to 'normal'
            pagination={true}
            paginationPageSize={10}
        />
    </div>
  );
}