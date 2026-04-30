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

type Props = {
  filter: string;
};

const getFinancialYearKey = (dateInput: string) => {
  const date = new Date(dateInput);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const startYear = month >= 3 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
};

export default function DashboardStatusTable({ filter }: Props) {
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
        const filteredForms =
          filter === "overall"
            ? res.data.forms || []
            : (res.data.forms || []).filter((form: Form) => getFinancialYearKey(form.created_on) === filter);

        setRowData(filteredForms);
      } catch (error) {
        console.error("Failed to fetch forms:", error);
      }
    };
  
    fetchForms();
  }, [filter]);
  

  return (
    <div className="ag-theme-alpine w-full h-[600px] rounded-xl overflow-hidden">
        <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            suppressCellFocus
            domLayout="normal" 
            pagination={true}
            paginationPageSize={10}
        />
    </div>
  );
}
