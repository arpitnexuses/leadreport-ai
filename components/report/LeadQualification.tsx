import React from 'react';
import { Badge } from "@/components/ui/badge";
import { LeadQualificationEdit } from './LeadQualificationEdit';
import { Star } from 'lucide-react';

interface LeadQualificationProps {
  qualificationCriteria: Record<string, string>;
  rating: string;
  isEditing: boolean;
  onCriteriaChange: (key: string, value: string) => void;
  onRatingChange: (rating: string) => void;
}

export function LeadQualification({
  qualificationCriteria,
  rating,
  isEditing,
  onCriteriaChange,
  onRatingChange
}: LeadQualificationProps) {
  
  if (isEditing) {
    return (
      <LeadQualificationEdit 
        qualificationCriteria={qualificationCriteria} 
        rating={rating}
        onCriteriaChange={onCriteriaChange}
        onRatingChange={onRatingChange}
      />
    );
  }
  
  // View mode
  return (
    <div className="space-y-4">
      {Object.entries(qualificationCriteria).map(([key, value], index) => (
        <div
          key={index}
          className="flex justify-between items-center pb-2 border-b border-gray-100"
        >
          <span className="font-medium text-gray-700 capitalize">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </span>
          <Badge
            className={
              value.toLowerCase() === "high" ||
              value.toLowerCase() === "yes"
                ? "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800"
                : value.toLowerCase() === "medium"
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-800"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-800"
            }
          >
            {value}
          </Badge>
        </div>
      ))}
      
      <div className="flex items-center gap-2 mt-6 pt-2 border-t border-gray-200">
        <div className="text-xl font-bold text-gray-900">
          Overall Score:
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold flex items-center">
          {rating || "N/A"}
          {rating && Number(rating) > 0 && (
            <span className="ml-2 flex">
              {Array.from({ length: Number(rating) }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </span>
          )}
        </div>
      </div>

      {/* Research Note */}
      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-base text-yellow-800 font-medium mb-1">
              Research-Based Assessment
            </p>
            <p className="text-sm text-yellow-700 leading-relaxed mb-1">
              This qualification is based on research, industry data, and our expert insights.
            </p>
            <p className="text-sm text-yellow-700 leading-relaxed">
              Our AI analyzes multiple data points to provide accurate lead scoring and recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 