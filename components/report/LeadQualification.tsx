import React from 'react';
import { Badge } from "@/components/ui/badge";
import { LeadQualificationEdit } from './LeadQualificationEdit';
import { Star, Info } from 'lucide-react';

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
  
  // View mode - Clean and minimal (matching new card style)
  return (
    <div className="space-y-4">
      {/* Qualification Criteria - Minimal List */}
      <div className="section-tint">
        {Object.entries(qualificationCriteria).map(([key, value], index) => (
          <div
            key={index}
            className={`flex justify-between items-center py-2.5 ${index !== Object.entries(qualificationCriteria).length - 1 ? 'mb-3' : ''}`}
          >
            <span className="text-sm font-bold text-gray-900 capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <Badge
              className={
                value.toLowerCase() === "high" ||
                value.toLowerCase() === "yes"
                  ? "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 border-green-200 text-sm font-bold uppercase"
                  : value.toLowerCase() === "medium"
                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:text-yellow-800 border-yellow-200 text-sm font-bold uppercase"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 border-gray-200 text-sm font-bold uppercase"
              }
            >
              {value}
            </Badge>
          </div>
        ))}
      </div>
      
      {/* Overall Score - Clean Display */}
      <div className="section-tint">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Star className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 capitalize">Overall Score</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Parse rating value - handle both numeric and emoji star strings */}
            {(() => {
              const numericRating = typeof rating === 'string' && rating.includes('⭐') 
                ? rating.split('⭐').length - 1 
                : parseInt(rating) || 0;
              
              return numericRating > 0 ? (
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(numericRating, 5) }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              ) : (
                <span className="text-sm font-bold text-gray-400">N/A</span>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
