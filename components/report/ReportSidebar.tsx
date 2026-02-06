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
  onNavigate,
  activeSection = "overview"
}: {
  completion?: number;
  lastUpdated?: string;
  createdBy?: string;
  onRemind?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  onNavigate?: (section: string) => void;
  activeSection?: string;
}) {
  return (
    <aside className="w-full max-w-[280px] h-screen bg-white border-r flex flex-col sticky top-0 overflow-y-auto">
      <div className="px-8 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-blue-600 mb-2 mt-[-12px]">Nexuses</h1>
          <p className="text-sm text-blue-600 font-medium tracking-wide uppercase">Lead Report</p>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full mt-4"></div>
        </div>
        <nav className="space-y-2">
          <SidebarLink 
            icon={<ChevronRight />} 
            label="Overview" 
            sectionId="overview"
            active={activeSection === "overview"} 
            onClick={() => onNavigate && onNavigate("overview")}
          />
          <SidebarLink 
            icon={<Briefcase />} 
            label="Company" 
            sectionId="company"
            active={activeSection === "company"} 
            onClick={() => onNavigate && onNavigate("company")}
          />
          <SidebarLink 
            icon={<Calendar />} 
            label="Meeting" 
            sectionId="meeting"
            active={activeSection === "meeting"} 
            onClick={() => onNavigate && onNavigate("meeting")}
          />
          <SidebarLink 
            icon={<MessageCircle />} 
            label="Interactions" 
            sectionId="interactions"
            active={activeSection === "interactions"} 
            onClick={() => onNavigate && onNavigate("interactions")}
          />
          <SidebarLink 
            icon={<Shield />} 
            label="Competitors" 
            sectionId="competitors"
            active={activeSection === "competitors"} 
            onClick={() => onNavigate && onNavigate("competitors")}
          />
          <SidebarLink 
            icon={<Cpu />} 
            label="Tech Stack" 
            sectionId="techStack"
            active={activeSection === "techStack"} 
            onClick={() => onNavigate && onNavigate("techStack")}
          />
          <SidebarLink 
            icon={<Newspaper />} 
            label="News" 
            sectionId="news"
            active={activeSection === "news"} 
            onClick={() => onNavigate && onNavigate("news")}
          />
          <SidebarLink 
            icon={<ArrowRight />} 
            label="Next Steps" 
            sectionId="nextSteps"
            active={activeSection === "nextSteps"} 
            onClick={() => onNavigate && onNavigate("nextSteps")}
          />
        </nav>
      </div>
      
      <div className="px-8 pb-8 mt-auto">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-blue-900">Report Status</span>
              <span className="text-sm font-bold text-blue-700">{completion}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-800 font-medium">Last updated</span>
              <span className="text-sm text-blue-700">{lastUpdated}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-800 font-medium">Created by</span>
              <span className="text-sm text-blue-700 font-medium">{createdBy}</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:text-blue-800" onClick={onRemind}>
            <Bell className="h-4 w-4 mr-2" /> Remind
          </Button>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ 
  icon, 
  label, 
  active, 
  onClick,
  sectionId 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
  sectionId: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
        active ? "bg-blue-50 text-blue-900 font-semibold" : "text-gray-700 hover:bg-gray-50"
      }`}
      onClick={onClick}
      data-section={sectionId}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span>{label}</span>
    </div>
  );
} 