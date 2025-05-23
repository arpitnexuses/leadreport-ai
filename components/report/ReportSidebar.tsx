import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Users, Calendar, Bell, Save, ChevronRight, BarChart2, Briefcase, MessageCircle, Shield, Cpu, Newspaper, ArrowRight } from "lucide-react";

export function ReportSidebar({
  completion = 85,
  lastUpdated = "May 12, 2025 • 14:30",
  createdBy = "Sarah Johnson",
  onRemind,
  onSave,
  isSaving = false,
}: {
  completion?: number;
  lastUpdated?: string;
  createdBy?: string;
  onRemind?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}) {
  return (
    <aside className="w-full max-w-[280px] min-h-screen bg-white border-r flex flex-col justify-between">
      <div>
        <div className="px-8 py-10">
          <h2 className="text-2xl font-bold text-blue-900 mb-10">Nexuses Lead Report</h2>
          <nav className="space-y-2">
            <SidebarLink icon={<ChevronRight />} label="Overview" active />
            <SidebarLink icon={<Briefcase />} label="Company" />
            <SidebarLink icon={<Calendar />} label="Meeting" />
            <SidebarLink icon={<MessageCircle />} label="Interactions" />
            <SidebarLink icon={<Shield />} label="Competitors" />
            <SidebarLink icon={<Cpu />} label="Tech Stack" />
            <SidebarLink icon={<Newspaper />} label="News" />
            <SidebarLink icon={<ArrowRight />} label="Next Steps" />
          </nav>
        </div>
        <div className="px-8 mt-10">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Report Status</span>
              <span className="text-sm text-gray-600">{completion}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Last updated</span>
              <span>{lastUpdated}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Created by</span>
              <span>{createdBy}</span>
            </div>
          </div>
          <div className="flex gap-3 mb-6">
            <Button variant="outline" className="flex-1" onClick={onRemind}>
              <Bell className="h-4 w-4 mr-2" /> Remind
            </Button>
            <Button variant="outline" className="flex-1" onClick={onSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      <footer className="px-8 py-6 bg-blue-900 text-white text-sm text-center rounded-t-xl">
        Acquire customers at <span className="font-bold">scale</span> • Increase conversion rates. Scale-up revenue.
      </footer>
    </aside>
  );
}

function SidebarLink({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
        active ? "bg-blue-50 text-blue-900 font-semibold" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span>{label}</span>
    </div>
  );
} 