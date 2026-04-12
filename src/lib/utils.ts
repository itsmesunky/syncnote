import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number) {
  if (seconds >= 3600) return `${Math.round(seconds / 3600)}시간`;
  if (seconds >= 60) return `${Math.round(seconds / 60)}분`;
  return `${Math.round(seconds)}초`;
}

export function assertNever(value: never): never {
  throw new Error(`${value}는 정의되지 않은 value입니다.`);
}
