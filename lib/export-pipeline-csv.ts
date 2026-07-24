import { getSharedReportUrl } from "@/lib/brand";
import { getLeadStatusLabel, normalizeLeadStatus } from "@/lib/lead-status";
import type { PipelineExportFilters, PipelineExportRow } from "@/lib/export-pipeline-pdf";

const CSV_HEADERS = [
  "First Name",
  "Last Name",
  "Company",
  "Title",
  "Lead Status",
  "Project",
  "Solutions",
  "Report Owner",
  "Created",
  "Public Report URL",
] as const;

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatCreatedDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function rowToCsvLine(row: PipelineExportRow, origin: string): string {
  const firstName = row.firstName || row.leadData?.name?.split(" ")[0] || "";
  const lastName =
    row.lastName || row.leadData?.name?.split(" ").slice(1).join(" ") || "";
  const company = row.leadData?.companyName || row.companyName || "";
  const title = row.leadData?.position || "";
  const status = getLeadStatusLabel(normalizeLeadStatus(row.leadData?.status));
  const project = row.leadData?.project || "";
  const solutions = (row.leadData?.solutions || []).join(", ");
  const owner = row.reportOwnerName || "";
  const created = formatCreatedDate(row.createdAt);
  const publicUrl = getSharedReportUrl(origin, row._id);

  return [
    firstName,
    lastName,
    company,
    title,
    status,
    project,
    solutions,
    owner,
    created,
    publicUrl,
  ]
    .map(escapeCsvField)
    .join(",");
}

export function exportPipelineTableCsv(
  rows: PipelineExportRow[],
  filters: PipelineExportFilters,
  origin: string
) {
  const lines = [
    CSV_HEADERS.join(","),
    ...rows.map((row) => rowToCsvLine(row, origin)),
  ];

  const csvContent = `\uFEFF${lines.join("\n")}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const monthSuffix =
    filters.selectedMonth !== "all" ? `-${filters.selectedMonth}` : "";
  const dateSuffix = new Date().toISOString().slice(0, 10);
  link.download = `nexuses-pipeline${monthSuffix}-${dateSuffix}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
