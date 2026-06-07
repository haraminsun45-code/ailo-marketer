"use client";

import type { Moment } from "@/lib/types";

const STORAGE_KEY = "memory-fragments:text-moments";

export function getStoredMoments(): Moment[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Moment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTextMoment(content: string): Moment {
  const moment: Moment = {
    id: `local-${Date.now()}`,
    type: "text",
    content,
    createdAt: new Date().toISOString()
  };

  const nextMoments = [moment, ...getStoredMoments()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextMoments));

  return moment;
}
