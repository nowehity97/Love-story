/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TimeElapsed } from "./types";

export function calculateTimeElapsed(startDate: string): TimeElapsed {
  const start = new Date(startDate);
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  return { years, months, days, totalDays };
}

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  // Remove leading slash if present to make it relative to the app's current directory
  const path = url.startsWith('/') ? url.substring(1) : url;
  return path;
}
