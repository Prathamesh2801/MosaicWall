import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const joinBaseAndPath = (base, path) => {
  if (!base) return path;
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};
