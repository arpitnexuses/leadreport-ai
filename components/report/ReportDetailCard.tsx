import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ReportDetailCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  bgColor?: string;
  children: React.ReactNode;
}

export function ReportDetailCard({ 
  title, 
  description,
  icon,
  bgColor = "bg-white",
  children 
}: ReportDetailCardProps) {
  return (
    <Card className="shadow-sm border">
      <CardHeader className={`${bgColor} border-b pb-4 flex flex-row items-center space-y-0 gap-2`}>
        {icon && <span className="text-blue-600">{icon}</span>}
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
} 