import ExcelJS from "exceljs";

const EXCLUDED_KEYS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "GeneratedForm",
  "AcknowledgementForm",
  "creatorId",
  "student_name",
]);

const toHeaderLabel = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatCellValue = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return value.toLocaleString("en-IN");
  return value;
};

const normalizeRows = (rows: any[]) =>
  rows.map((item) => {
    const { GeneratedForm, ...formData } = item;
    const generatedData = GeneratedForm || {};

    return Object.fromEntries(
      Object.entries({ ...formData, ...generatedData }).filter(
        ([key]) => !EXCLUDED_KEYS.has(key)
      )
    );
  });

export const downloadExcelWorkbook = async (
  rows: any[],
  fileName: string,
  sheetName: string
) => {
  const normalizedRows = normalizeRows(rows);

  if (!normalizedRows.length) {
    throw new Error("No rows available for export.");
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  const columnKeys = Object.keys(normalizedRows[0]);

  worksheet.columns = columnKeys.map((key) => ({
    header: toHeaderLabel(key),
    key,
    width: Math.max(toHeaderLabel(key).length + 4, 18),
  }));

  normalizedRows.forEach((row) => {
    const formattedRow = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, formatCellValue(value)])
    );
    worksheet.addRow(formattedRow);
  });

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F6FEB" },
  };

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });
  });

  worksheet.columns.forEach((column) => {
    let maxLength = column.header ? column.header.toString().length : 10;

    column.eachCell?.({ includeEmpty: true }, (cell) => {
      maxLength = Math.max(maxLength, cell.value ? cell.value.toString().length : 0);
    });

    column.width = Math.min(Math.max(maxLength + 2, 14), 40);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};
