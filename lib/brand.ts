export const NEXUSES_BRAND_NAME = "Nexuses";

export const NEXUSES_LOGO_DARK_URL =
  "https://cdn-nexlink.s3.us-east-2.amazonaws.com/Nexuses-full-logo-dark_8d412ea3-bf11-4fc6-af9c-bee7e51ef494.png";

export const NEXUSES_LOGO_WHITE_URL =
  "https://cdn-nexlink.s3.us-east-2.amazonaws.com/Nexuses-logo-white_fcc59df4-b0be-47d1-b2ae-aeea3835a1b0.png";

export function getSharedReportUrl(origin: string, reportId: string) {
  return `${origin.replace(/\/$/, "")}/shared-report/${reportId}`;
}
