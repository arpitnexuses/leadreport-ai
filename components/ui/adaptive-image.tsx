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