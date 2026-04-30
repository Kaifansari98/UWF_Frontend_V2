import apiClient from "./apiClient";
import { downloadExcelWorkbook } from "./downloadExcelWorkbook";

export const exportCurrentYearClosedFormsToExcel = async () => {
  try {
    const response = await apiClient.get("/submissions/case-closed/current-year");
    const forms = response.data.caseClosedForms;

    if (!forms || forms.length === 0) {
      throw new Error("No closed forms found for current year.");
    }

    await downloadExcelWorkbook(
      forms,
      `ClosedForms_${new Date().getFullYear()}.xlsx`,
      `Closed Forms ${new Date().getFullYear()}`
    );
  } catch (error: any) {
    console.error("Export failed:", error);
    throw error;
  }
};
