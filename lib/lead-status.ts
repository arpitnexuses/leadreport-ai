export const LEAD_STATUS_ORDER = [
  "warm",
  "hot",
  "meeting_scheduled",
  "meeting_rescheduled",
  "meeting_done",
] as const;

export type LeadStatus = (typeof LEAD_STATUS_ORDER)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  hot: "Hot",
  warm: "Warm",
  meeting_scheduled: "Meeting Scheduled",
  meeting_rescheduled: "Meeting Rescheduled",
  meeting_done: "Meeting Done",
};

export const LEAD_STATUS_UI: Record<
  LeadStatus,
  {
    textClass: string;
    badgeClass: string;
    activeSegmentClass: string;
    inactiveSegmentClass: string;
    chartColor: string;
  }
> = {
  hot: {
    textClass: "text-red-600",
    badgeClass: "bg-red-50 text-red-600",
    activeSegmentClass: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.25)]",
    inactiveSegmentClass: "bg-red-100/50",
    chartColor: "#EF4444",
  },
  warm: {
    textClass: "text-orange-600",
    badgeClass: "bg-orange-50 text-orange-600",
    activeSegmentClass: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.25)]",
    inactiveSegmentClass: "bg-orange-100/50",
    chartColor: "#F97316",
  },
  meeting_scheduled: {
    textClass: "text-blue-600",
    badgeClass: "bg-blue-50 text-blue-600",
    activeSegmentClass: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.25)]",
    inactiveSegmentClass: "bg-blue-100/50",
    chartColor: "#3B82F6",
  },
  meeting_rescheduled: {
    textClass: "text-amber-600",
    badgeClass: "bg-amber-50 text-amber-600",
    activeSegmentClass: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.25)]",
    inactiveSegmentClass: "bg-amber-100/50",
    chartColor: "#F59E0B",
  },
  meeting_done: {
    textClass: "text-emerald-600",
    badgeClass: "bg-emerald-50 text-emerald-600",
    activeSegmentClass: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.25)]",
    inactiveSegmentClass: "bg-emerald-100/50",
    chartColor: "#10B981",
  },
};

export const normalizeLeadStatus = (status?: string): LeadStatus => {
  if (!status) return "warm";
  if (LEAD_STATUS_ORDER.includes(status as LeadStatus)) {
    return status as LeadStatus;
  }
  return "warm";
};

export const getLeadStatusLabel = (status?: string): string =>
  LEAD_STATUS_LABELS[normalizeLeadStatus(status)];
