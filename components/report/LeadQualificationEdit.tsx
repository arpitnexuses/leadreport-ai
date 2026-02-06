import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";

interface LeadQualificationEditProps {
  qualificationCriteria: Record<string, string>;
  rating: string;
  onCriteriaChange: (key: string, value: string) => void;
  onRatingChange: (rating: string) => void;
}

export function LeadQualificationEdit({
  qualificationCriteria,
  rating,
  onCriteriaChange,
  onRatingChange
}: LeadQualificationEditProps) {
  // Function to handle toggle changes
  const handleToggleChange = (key: string, checked: boolean) => {
    console.log(`Toggle changed for ${key}: ${checked ? "Yes" : "No"}`);
    onCriteriaChange(key, checked ? "Yes" : "No");
  };

  const formatLabel = (key: string): string => {
    return key.replace(/([A-Z])/g, " $1").trim();
  };

  // This forces a re-render when props change
  React.useEffect(() => {
    console.log("LeadQualificationEdit updated:", qualificationCriteria, rating);
  }, [qualificationCriteria, rating]);

  return (
    <div className="space-y-4">
      {Object.entries(qualificationCriteria).map(([key, value], index) => {
        const isYes = value.toLowerCase() === "yes";
        
        return (
          <div
            key={index}
            className="flex justify-between items-center pb-3 border-b border-gray-100"
          >
            <Label className="font-medium text-gray-700 capitalize">
              {formatLabel(key)}
            </Label>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm">
                <span className={isYes ? "text-green-600 font-medium" : "text-gray-400"}>Yes</span>
                <Switch 
                  checked={isYes}
                  onCheckedChange={(checked) => {
                    console.log(`Switch toggled: ${key} - new value: ${checked}`);
                    handleToggleChange(key, checked);
                  }}
                />
                <span className={!isYes ? "text-red-600 font-medium" : "text-gray-400"}>No</span>
              </div>
              
              <Badge
                className={
                  isYes
                    ? "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800"
                    : "bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-800"
                }
              >
                {value}
              </Badge>
            </div>
          </div>
        );
      })}
      
      <div className="flex items-center gap-2 mt-6 pt-2 border-t border-gray-200">
        <div className="text-base font-bold text-gray-900">
          Overall Score:
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={rating} 
            onValueChange={(value) => {
              console.log(`Rating changed to: ${value}`);
              onRatingChange(value);
            }}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">⭐ 1</SelectItem>
              <SelectItem value="2">⭐⭐ 2</SelectItem>
              <SelectItem value="3">⭐⭐⭐ 3</SelectItem>
              <SelectItem value="4">⭐⭐⭐⭐ 4</SelectItem>
              <SelectItem value="5">⭐⭐⭐⭐⭐ 5</SelectItem>
            </SelectContent>
          </Select>
          
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
      </div>
    </div>
  );
} 