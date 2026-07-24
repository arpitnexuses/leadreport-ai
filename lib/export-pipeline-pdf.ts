import jsPDF from "jspdf";
import {
  NEXUSES_BRAND_NAME,
  NEXUSES_LOGO_DARK_URL,
  getSharedReportUrl,
} from "@/lib/brand";
import {
  getLeadStatusLabel,
  normalizeLeadStatus,
  LEAD_STATUS_UI,
} from "@/lib/lead-status";

export interface PipelineExportRow {
  _id: string;
  firstName?: string;
  lastName?: string;
  reportOwnerName?: string;
  createdAt: string;
  leadData?: {
    name?: string;
    companyName?: string;
    position?: string;
    project?: string;
    solutions?: string[];
    status?: string;
  };
  companyName?: string;
}

export interface PipelineExportFilters {
  searchQuery: string;
  selectedProject: string;
  selectedSolution: string;
  selectedOwner: string;
  selectedMonth: string;
  formatMonthLabel: (monthKey: string) => string;
}

const PAGE_MARGIN = 14;
const CARD_GAP = 8;
const CARD_PADDING = 6;
const NEXUSES_PIPELINE_LOGO_URL = NEXUSES_LOGO_DARK_URL;

async function loadImageViaCanvas(url: string): Promise<string | null> {
  if (typeof window === "undefined") return null;

  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(null);
          return;
        }
        context.drawImage(image, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  const fromCanvas = await loadImageViaCanvas(url);
  if (fromCanvas) return fromCanvas;

  const sources = [url, "/api/brand-logo"];

  for (const source of sources) {
    try {
      const response = await fetch(source);
      if (!response.ok) continue;
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
      }
      return `data:image/png;base64,${btoa(binary)}`;
    } catch {
      continue;
    }
  }

  return null;
}

function getLeadName(row: PipelineExportRow) {
  const fullName = `${row.firstName || ""} ${row.lastName || ""}`.trim();
  return fullName || row.leadData?.name || "Unknown lead";
}

function buildFilterSummary(filters: PipelineExportFilters) {
  const parts: string[] = [];

  if (filters.selectedMonth !== "all") {
    parts.push(`Month: ${filters.formatMonthLabel(filters.selectedMonth)}`);
  }
  if (filters.selectedProject !== "all") {
    parts.push(`Project: ${filters.selectedProject}`);
  }
  if (filters.selectedSolution !== "all") {
    parts.push(`Solution: ${filters.selectedSolution}`);
  }
  if (filters.selectedOwner !== "all") {
    parts.push(`Owner: ${filters.selectedOwner}`);
  }
  if (filters.searchQuery.trim()) {
    parts.push(`Search: "${filters.searchQuery.trim()}"`);
  }

  return parts.length > 0 ? parts.join(" · ") : "All leads";
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function wrapText(doc: jsPDF, text: string, maxWidth: number, fontSize: number) {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text, maxWidth) as string[];
}

function measureCardHeight(
  doc: jsPDF,
  row: PipelineExportRow,
  cardWidth: number,
  origin: string
) {
  const innerWidth = cardWidth - CARD_PADDING * 2;
  const solutions = (row.leadData?.solutions || []).join(", ") || "—";
  const publicUrl = getSharedReportUrl(origin, row._id);

  let height = CARD_PADDING + 8 + 6 + 6 + 18 + 6;
  height += wrapText(doc, `Solutions: ${solutions}`, innerWidth, 9).length * 4.2;
  height += wrapText(doc, publicUrl, innerWidth - 2, 8.5).length * 3.8;
  height += CARD_PADDING + 4;

  return Math.max(height, 52);
}

function drawLeadCard(
  doc: jsPDF,
  row: PipelineExportRow,
  x: number,
  y: number,
  cardWidth: number,
  cardHeight: number,
  origin: string
) {
  const innerX = x + CARD_PADDING;
  const innerWidth = cardWidth - CARD_PADDING * 2;
  const status = normalizeLeadStatus(row.leadData?.status);
  const statusLabel = getLeadStatusLabel(status);
  const statusColor = hexToRgb(LEAD_STATUS_UI[status].chartColor);
  const company = row.leadData?.companyName || row.companyName || "—";
  const position = row.leadData?.position || "—";
  const project = row.leadData?.project || "—";
  const owner = row.reportOwnerName || "—";
  const created = new Date(row.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const solutions = (row.leadData?.solutions || []).join(", ") || "—";
  const publicUrl = getSharedReportUrl(origin, row._id);
  const leadName = getLeadName(row);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(82, 82, 91);
  doc.setLineWidth(0.35);
  doc.roundedRect(x, y, cardWidth, cardHeight, 2.5, 2.5, "FD");
  doc.setLineWidth(0.25);

  const badgeWidth = Math.min(innerWidth * 0.38, doc.getTextWidth(statusLabel) + 8);
  const badgeX = x + cardWidth - CARD_PADDING - badgeWidth;
  const nameMaxWidth = badgeX - innerX - 3;
  const nameLines = wrapText(doc, leadName, nameMaxWidth, 12).slice(0, 1);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(29, 29, 31);
  doc.text(nameLines[0] || leadName, innerX, y + 8);
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(badgeX, y + 4.5, badgeWidth, 6, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(statusLabel, badgeX + 4, y + 8.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`${position} · ${company}`, innerX, y + 14);

  doc.setDrawColor(243, 244, 246);
  doc.line(innerX, y + 17, innerX + innerWidth, y + 17);

  let detailY = y + 23;
  const detailRows: [string, string][] = [
    ["Project", project],
    ["Owner", owner],
    ["Created", created],
  ];

  detailRows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(label, innerX, detailY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(29, 29, 31);
    doc.text(value, innerX + 22, detailY);
    detailY += 5.5;
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text("Solutions", innerX, detailY + 1);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  const solutionLines = wrapText(doc, solutions, innerWidth, 9);
  solutionLines.forEach((line, index) => {
    doc.text(line, innerX, detailY + 5.5 + index * 4.2);
  });

  const urlStartY = detailY + 5.5 + solutionLines.length * 4.2 + 3;
  doc.setDrawColor(243, 244, 246);
  doc.line(innerX, urlStartY - 2, innerX + innerWidth, urlStartY - 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(107, 114, 128);
  doc.text("Public report", innerX, urlStartY + 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(37, 99, 235);
  const urlLines = wrapText(doc, publicUrl, innerWidth, 8.5);
  urlLines.forEach((line, index) => {
    doc.textWithLink(line, innerX, urlStartY + 6.5 + index * 3.8, { url: publicUrl });
  });
}

function drawPageFooter(doc: jsPDF, page: number, pageCount: number, startX: number, contentWidth: number) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 10;

  doc.setDrawColor(229, 231, 235);
  doc.line(startX, footerY - 4, startX + contentWidth, footerY - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  doc.text(`${NEXUSES_BRAND_NAME} · Lead Pipeline Report`, startX, footerY);
  doc.text(
    `Page ${page} of ${pageCount}`,
    startX + contentWidth,
    footerY,
    { align: "right" }
  );
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text(
    `© ${new Date().getFullYear()} ${NEXUSES_BRAND_NAME}. Confidential internal report.`,
    startX + contentWidth / 2,
    footerY + 4,
    { align: "center" }
  );
}

function drawNewsletterHeader(
  doc: jsPDF,
  options: {
    logoBase64: string | null;
    filters: PipelineExportFilters;
    leadCount: number;
    startX: number;
    contentWidth: number;
    pageWidth: number;
  }
): number {
  const { logoBase64, filters, leadCount, startX, contentWidth, pageWidth } = options;
  const accentColor: [number, number, number] = [30, 63, 172];
  const endX = startX + contentWidth;
  const now = new Date();

  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const issueLabel =
    filters.selectedMonth !== "all"
      ? filters.formatMonthLabel(filters.selectedMonth)
      : now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const filterSummary = buildFilterSummary(filters);
  const filterLines = wrapText(doc, filterSummary, contentWidth * 0.52, 8.5);
  const statsStripHeight = filterLines.length > 1 ? 18 : 15;

  let y = 0;

  doc.setFillColor(...accentColor);
  doc.rect(0, y, pageWidth, 2, "F");
  y = 11;

  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", startX, y + 1, 52, 12);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...accentColor);
    doc.text(NEXUSES_BRAND_NAME, startX, y + 8);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...accentColor);
  doc.text("PIPELINE DIGEST", endX, y + 4, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(82, 82, 91);
  doc.text(dateLabel, endX, y + 9, { align: "right" });
  doc.text(`Issue · ${issueLabel}`, endX, y + 13.5, { align: "right" });

  y += 17;

  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.25);
  doc.line(startX, y, endX, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...accentColor);
  doc.text(`MONTHLY PIPELINE · ${issueLabel.toUpperCase()}`, startX, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);
  doc.setTextColor(24, 24, 27);
  doc.text("Lead Pipeline Report", startX, y);
  y += 3;

  doc.setFillColor(...accentColor);
  doc.rect(startX, y + 1.5, 40, 1.1, "F");
  y += 9;

  doc.setFillColor(...accentColor);
  doc.roundedRect(startX, y, contentWidth, statsStripHeight, 2, 2, "F");

  const leadsLabel = `${leadCount} ${leadCount === 1 ? "Lead" : "Leads"}`;
  const stripCenterY = y + statsStripHeight / 2 + 1.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(leadsLabel, startX + 6, stripCenterY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(191, 203, 255);
  doc.text("FILTERS APPLIED", endX - 6, y + 4.5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  if (filterLines.length === 1) {
    doc.text(filterLines[0], endX - 6, y + 10.5, { align: "right" });
  } else {
    filterLines.forEach((line, index) => {
      doc.text(line, endX - 6, y + 10.5 + index * 4.5, { align: "right" });
    });
  }

  y += statsStripHeight + 12;

  doc.setDrawColor(228, 228, 231);
  doc.line(startX, y, endX, y);
  y += 9;

  return y;
}

export async function exportPipelineTablePdf(
  rows: PipelineExportRow[],
  filters: PipelineExportFilters,
  origin: string
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const cardWidth = contentWidth;
  const startX = PAGE_MARGIN;

  const logoBase64 = await fetchImageAsBase64(NEXUSES_PIPELINE_LOGO_URL);
  let y = drawNewsletterHeader(doc, {
    logoBase64,
    filters,
    leadCount: rows.length,
    startX,
    contentWidth,
    pageWidth,
  });

  rows.forEach((row) => {
    const cardHeight = measureCardHeight(doc, row, cardWidth, origin);

    if (y + cardHeight > pageHeight - PAGE_MARGIN - 16) {
      doc.addPage();
      y = PAGE_MARGIN + 4;
    }

    drawLeadCard(doc, row, startX, y, cardWidth, cardHeight, origin);
    y += cardHeight + CARD_GAP;
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    drawPageFooter(doc, page, pageCount, startX, contentWidth);
  }

  const monthSuffix =
    filters.selectedMonth !== "all" ? `-${filters.selectedMonth}` : "";
  const dateSuffix = new Date().toISOString().slice(0, 10);
  doc.save(`nexuses-pipeline${monthSuffix}-${dateSuffix}.pdf`);
}
