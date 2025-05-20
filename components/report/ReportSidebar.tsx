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
}: {
  completion?: number;
  lastUpdated?: string;
  createdBy?: string;
  onRemind?: () => void;
  onSave?: () => void;
}) {
  return (
    <aside className="w-full max-w-[260px] min-h-screen bg-white border-r flex flex-col justify-between">
      <div>
        <div className="px-6 py-8">
          <h2 className="text-xl font-bold text-blue-900 mb-8">Nexuses Lead Report</h2>
          <nav className="space-y-1">
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
        <div className="px-6 mt-8">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 font-medium">Report Status</span>
              <span className="text-xs text-gray-500">Completion</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Last updated</span>
              <span>{lastUpdated}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Created by</span>
              <span>{createdBy}</span>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <Button variant="outline" className="flex-1" onClick={onRemind}>
              <Bell className="h-4 w-4 mr-1" /> Remind
            </Button>
            <Button variant="outline" className="flex-1" onClick={onSave}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>
      </div>
      <footer className="px-6 py-4 bg-blue-900 text-white text-xs text-center rounded-t-xl">
        Acquire customers at <span className="font-bold">scale</span> • Increase conversion rates. Scale-up revenue.
      </footer>
    </aside>
  );
}

function SidebarLink({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        active ? "bg-blue-100 text-blue-900 font-semibold" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span>{label}</span>
    </div>
  );
} 