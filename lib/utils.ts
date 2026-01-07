import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { SUPPORTED_LANGUAGES } from "@/lib/constants";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find((lang) => lang.code === code)?.name || code;
  };
