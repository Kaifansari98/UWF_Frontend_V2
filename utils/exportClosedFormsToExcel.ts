import apiClient from "./apiClient";
import { downloadCsv } from "./downloadCsv";

export const exportClosedFormsToExcel = async () => {
  try {
    const response = await apiClient.get("/submissions/case-closed");
    const forms = response.data.caseClosedForms;

    if (!forms || forms.length === 0) {
      throw new Error("No closed forms available.");
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

    downloadCsv(filtered, "ClosedForms.csv");
  } catch (error: any) {
    console.error("Export failed:", error);
    throw error;
  }
};
