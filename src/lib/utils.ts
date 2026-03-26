import { type ClassValue, clsx } from "clsx";
import humanizeDuration from "humanize-duration";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number) {
  return humanizeDuration(seconds * 1000, {
    largest: 1,
    round: true,
    spacer: "",
    units: ["h", "m", "s"],
    language: "ko",
  });
}

export function assertNever(value: never): never {
  throw new Error(`${value}는 정의되지 않은 value입니다.`);
}
