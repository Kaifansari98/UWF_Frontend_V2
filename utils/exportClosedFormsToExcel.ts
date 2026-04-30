import apiClient from "./apiClient";
import { downloadExcelWorkbook } from "./downloadExcelWorkbook";

export const exportClosedFormsToExcel = async () => {
  try {
    const response = await apiClient.get("/submissions/case-closed");
    const forms = response.data.caseClosedForms;

    if (!forms || forms.length === 0) {
      throw new Error("No closed forms available.");
    }

    await downloadExcelWorkbook(forms, "ClosedForms.xlsx", "Closed Forms");
  } catch (error: any) {
    console.error("Export failed:", error);
    throw error;
  }
};
