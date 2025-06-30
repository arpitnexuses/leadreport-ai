import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { ImagePlaceholder } from './image-placeholder';

interface AdaptiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  className?: string;
  priority?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  placeholderType?: "user" | "company" | "generic";
  showPlaceholder?: boolean;
}

export const AdaptiveImage = ({
  src,
  alt,
  width = 200,
  height = 200,
  fallbackSrc = "/placeholder-image.png",
  className,
  priority = false,
  objectFit = "cover",
  placeholderType = "generic",
  showPlaceholder = false
}: AdaptiveImageProps) => {
  const [imgSrc, setImgSrc] = React.useState<string>(src);
  const [error, setError] = React.useState<boolean>(false);

  React.useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  const handleError = () => {
    setError(true);
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  // Check if the src is a base64 data URL
  const isBase64 = src.startsWith('data:image');

  if (showPlaceholder) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <ImagePlaceholder 
          type={placeholderType} 
          width={width} 
          height={height}
        />
      </div>
    );
  }

  // Use regular img tag for base64 data URLs
  if (isBase64) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <img
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          onError={handleError}
          style={{ objectFit }}
          className={cn("transition-opacity duration-300", error ? "opacity-80" : "")}
        />
      </div>
    );
  }

  // Use Next.js Image for regular URLs
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        onError={handleError}
        style={{ objectFit }}
        className={cn("transition-opacity duration-300", error ? "opacity-80" : "")}
      />
    </div>
  );
}; 