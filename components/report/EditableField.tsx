import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  multiline?: boolean;
  className?: string;
}

export function EditableField({ 
  value, 
  onChange, 
  isEditing, 
  multiline = false,
  className = "" 
}: EditableFieldProps) {
  if (!isEditing) {
    return <p className={className}>{value}</p>;
  }
  
  if (multiline) {
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-[80px] py-1 ${className}`}
      />
    );
  }
  
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`py-1 h-7 ${className}`}
    />
  );
} 