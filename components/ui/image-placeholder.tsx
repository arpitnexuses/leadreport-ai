import React from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon, User, Building } from 'lucide-react';

interface ImagePlaceholderProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  iconSize?: number;
  iconColor?: string;
  text?: string;
  type?: "user" | "company" | "generic";
}

export const ImagePlaceholder = ({
  className,
  width = 200,
  height = 200,
  iconSize = 48,
  iconColor = "currentColor",
  text,
  type = "generic"
}: ImagePlaceholderProps) => {
  const renderIcon = () => {
    switch(type) {
      case "user":
        return <User size={iconSize} className="text-muted-foreground opacity-50" color={iconColor} />;
      case "company":
        return <Building size={iconSize} className="text-muted-foreground opacity-50" color={iconColor} />;
      case "generic":
      default:
        return <ImageIcon size={iconSize} className="text-muted-foreground opacity-50" color={iconColor} />;
    }
  };
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center bg-muted rounded-md",
        className
      )}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
    >
      {renderIcon()}
      {text && (
        <p className="mt-2 text-xs text-muted-foreground">{text}</p>
      )}
    </div>
  );
}; 