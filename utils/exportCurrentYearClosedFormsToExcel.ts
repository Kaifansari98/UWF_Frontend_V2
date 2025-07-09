import * as XLSX from "xlsx";
import apiClient from "./apiClient";

export const exportCurrentYearClosedFormsToExcel = async () => {
  try {
    const response = await apiClient.get("/submissions/case-closed/current-year");
    const forms = response.data.caseClosedForms;

    if (!forms || forms.length === 0) {
      throw new Error("No closed forms found for current year.");
    }

    const filtered = forms.map((item: any) => {
      const {
        id,
        createdAt,
        updatedAt,
        GeneratedForm,
        ...formData
      } = item;

      const {
        id: gId,
        creatorId,
        student_name,
        createdAt: gCreatedAt,
        updatedAt: gUpdatedAt,
        ...generatedData
      } = GeneratedForm || {};

      return {
        ...formData,
        ...generatedData,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Closed Forms Current Year");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ClosedForms_${new Date().getFullYear()}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error("Export failed:", error);
    throw error;
  }
};
