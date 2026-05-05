/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Photo {
  id: string;
  url: string;
  caption: string;
  date: string;
  createdAt: number;
  userId: string;
}

export interface TimeElapsed {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}
