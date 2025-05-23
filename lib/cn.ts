import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Use a dynamic import for tailwind-merge to avoid bundling issues
export async function getTwMerge() {
  const { twMerge } = await import("tailwind-merge");
  return twMerge;
}

export async function cnAsync(...inputs: ClassValue[]) {
  const twMerge = await getTwMerge();
  return twMerge(clsx(inputs));
}

// For synchronous usage, this might lead to a warning but could work for now
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 