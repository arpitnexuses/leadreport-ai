import * as React from "react"
import { AutocompleteInput } from "./autocomplete-input"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

// New component for meeting details
interface MeetingDetailsFormProps {
  disabled?: boolean;
  visibleSections?: MeetingDetailsSection[];
}

export type MeetingDetailsSection =
  | "lead-information"
  | "lead-company-context"
  | "meeting-details"
  | "internal-notes";

export const MeetingDetailsForm = ({
  disabled = false,
  visibleSections,
}: MeetingDetailsFormProps) => {
  const sectionsToShow = visibleSections ?? [
    "lead-information",
    "lead-company-context",
    "meeting-details",
    "internal-notes",
  ];

  const shouldRenderSection = (section: MeetingDetailsSection) =>
    sectionsToShow.includes(section);

  return (
    <div className="space-y-8">
      {/* SECTION 1: BASIC INFO */}
      {shouldRenderSection("lead-information") && (
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Lead Information</h3>

        {/* Industry Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <Input 
            type="text" 
            name="leadIndustry" 
            placeholder="Lead's Industry (e.g., SaaS, E-commerce, Healthcare)"
            disabled={disabled}
            className="pl-12 h-14 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        {/* Lead Designation */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <Input 
            type="text" 
            name="leadDesignation" 
            placeholder="Lead's Designation/Role (e.g., VP of Sales)"
            disabled={disabled}
            className="pl-12 h-14 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>
      </div>
      )}

      {/* SECTION 2: LEAD & COMPANY CONTEXT */}
      {shouldRenderSection("lead-company-context") && (
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Lead & Company Context</h3>
        
        {/* Company Overview */}
        <div className="relative">
          <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <textarea
            name="companyOverview" 
            placeholder="Company Overview (Brief notes about the company)"
            rows={3}
            disabled={disabled}
            className="pl-12 pt-3 pb-3 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 resize-none shadow-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
          />
        </div>

        {/* Lead Background Notes */}
        <div className="relative">
          <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <textarea
            name="leadBackground" 
            placeholder="Lead Background (Notes about lead's role, responsibilities, pain points)"
            rows={3}
            disabled={disabled}
            className="pl-12 pt-3 pb-3 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 resize-none shadow-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
          />
        </div>

        {/* Problem/Pitch */}
        <div className="relative">
          <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <textarea
            name="problemPitch" 
            placeholder="Problem/Solution Pitch (Brief description of what you're offering)"
            rows={3}
            disabled={disabled}
            className="pl-12 pt-3 pb-3 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 resize-none shadow-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
          />
        </div>
      </div>
      )}

      {/* SECTION 3: MEETING DETAILS */}
      {shouldRenderSection("meeting-details") && (
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Meeting Details</h3>

        {/* Meeting Name */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <Input 
            type="text" 
            name="meetingName" 
            placeholder="Meeting Name/Title (e.g., 'Q1 Strategy Review', 'Product Demo')" 
            disabled={disabled}
            className="pl-12 h-14 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        {/* Meeting Date */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <Input 
            type="date" 
            name="meetingDate" 
            disabled={disabled}
            className="pl-12 h-14 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900"
          />
        </div>
        
        {/* Meeting Time & Timezone */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <Input 
              type="time" 
              name="meetingTime" 
              disabled={disabled}
              className="pl-12 h-14 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
            </div>
            <select
              name="meetingTimezone"
              disabled={disabled}
              className="pl-12 h-14 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 w-full"
            >
              <option value="">Select Timezone</option>
              <option value="America/New_York">EST (UTC-5)</option>
              <option value="America/Chicago">CST (UTC-6)</option>
              <option value="America/Denver">MST (UTC-7)</option>
              <option value="America/Los_Angeles">PST (UTC-8)</option>
              <option value="Europe/London">GMT (UTC+0)</option>
              <option value="Europe/Paris">CET (UTC+1)</option>
              <option value="Asia/Dubai">GST (UTC+4)</option>
              <option value="Asia/Kolkata">IST (UTC+5:30)</option>
              <option value="Asia/Singapore">SGT (UTC+8)</option>
              <option value="Asia/Tokyo">JST (UTC+9)</option>
              <option value="Australia/Sydney">AEDT (UTC+11)</option>
            </select>
          </div>
        </div>

        {/* Meeting Platform */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <Input 
            type="text" 
            name="meetingPlatform" 
            placeholder="Meeting Platform (e.g., Zoom, Google Meet, Teams)" 
            disabled={disabled}
            className="pl-12 h-14 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        {/* Meeting Link */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </div>
          <Input 
            type="url" 
            name="meetingLink" 
            placeholder="Meeting Link (URL for Join button)" 
            disabled={disabled}
            className="pl-12 h-14 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        {/* Meeting Location (Physical) */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <Input 
            type="text" 
            name="meetingLocation" 
            placeholder="Physical Location (Address/Venue - if applicable)" 
            disabled={disabled}
            className="pl-12 h-14 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        {/* Meeting Objective/Agenda */}
        <div className="relative">
          <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <textarea
            name="meetingObjective" 
            placeholder="Meeting Objective & Agenda (What do you want to achieve?)"
            rows={3}
            disabled={disabled}
            className="pl-12 pt-3 pb-3 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 resize-none shadow-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
          />
        </div>
      </div>
      )}

      {/* SECTION 4: INTERNAL NOTES & ACTIVITY */}
      {shouldRenderSection("internal-notes") && (
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Internal Notes & Activity</h3>
        
        {/* Initial Internal Note */}
        <div className="relative">
          <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <textarea
            name="initialNote" 
            placeholder="Internal Note (Private notes for your team - won't be shared with client)"
            rows={3}
            disabled={disabled}
            className="pl-12 pt-3 pb-3 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 resize-none shadow-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
          />
        </div>

        {/* Initial Activity for Timeline */}
        <div className="relative">
          <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <textarea
            name="initialActivity" 
            placeholder="Initial Activity (Timeline entry - e.g., 'First contact via LinkedIn', 'Referred by John Doe')"
            rows={3}
            disabled={disabled}
            className="pl-12 pt-3 pb-3 w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-900 resize-none shadow-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
          />
        </div>
      </div>
      )}
    </div>
  );
};
