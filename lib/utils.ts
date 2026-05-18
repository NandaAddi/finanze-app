import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getOptimizedAvatarUrl(url: string | null | undefined, size = 96): string | undefined {
  if (!url) return undefined;
  if (url.includes('clerk.com') || url.includes('img.clerk.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${size}`;
  }
  return url;
}
