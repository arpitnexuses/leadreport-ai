import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OverviewSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div className="section overview-section mb-8">{children}</div>;
}

export function CompanySection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div className="section company-section mb-8">{children}</div>;
}

export function MeetingSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div className="section meeting-section mb-8">{children}</div>;
}

export function InteractionsSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div className="section interactions-section mb-8">{children}</div>;
}

export function CompetitorsSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div className="section competitors-section mb-8">{children}</div>;
}

export function TechStackSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div className="section tech-stack-section mb-8">{children}</div>;
}

export function NewsSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div className="section news-section mb-8">{children}</div>;
}

export function NextStepsSection({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
  if (!visible) return null;
  return <div className="section next-steps-section mb-8">{children}</div>;
}

export function CompanyInfoCard({ companyName, industry, employees, headquarters, website, companyLogo, companyDescription, fundingStage, fundingTotal }: { 
  companyName: string;
  industry: string;
  employees: string;
  headquarters: string;
  website: string;
  companyLogo?: string;
  companyDescription?: string;
  fundingStage?: string;
  fundingTotal?: string | number;
}) {
  return (
    <Card className="shadow-sm border">
      <CardHeader className="bg-blue-50 border-b pb-4">
        <div className="flex items-center gap-4">
          {companyLogo && (
            <img src={companyLogo} alt={companyName} className="w-12 h-12 object-contain" />
          )}
          <div>
            <CardTitle className="text-xl">{companyName}</CardTitle>
            <p className="text-sm text-gray-500">{industry}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Employees</p>
            <p className="font-medium">{employees}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Headquarters</p>
            <p className="font-medium">{headquarters}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Website</p>
            <a href={website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-800">
              {website}
            </a>
          </div>
          {fundingStage && (
            <div>
              <p className="text-sm text-gray-500">Funding Stage</p>
              <p className="font-medium">{fundingStage}</p>
            </div>
          )}
          {fundingTotal && (
            <div>
              <p className="text-sm text-gray-500">Total Funding</p>
              <p className="font-medium">
                {typeof fundingTotal === 'number' 
                  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(fundingTotal)
                  : fundingTotal}
              </p>
            </div>
          )}
        </div>
        {companyDescription && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Company Description</p>
            <p className="text-sm text-gray-700">{companyDescription}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ReportGridLayout({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>;
} 