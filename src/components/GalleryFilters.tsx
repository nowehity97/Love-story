/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Calendar, Search, X, SortDesc } from 'lucide-react';

interface GalleryFiltersProps {
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: 'event' | 'upload') => void;
  selectedYear: string;
  selectedMonth: string;
  searchQuery: string;
  sortBy: 'event' | 'upload';
  availableYears: string[];
}

export default function GalleryFilters({
  onYearChange,
  onMonthChange,
  onSearchChange,
  onSortChange,
  selectedYear,
  selectedMonth,
  searchQuery,
  sortBy,
  availableYears
}: GalleryFiltersProps) {
  const months = [
    { value: '', label: 'Wszystkie miesiące' },
    { value: '01', label: 'Styczeń' },
    { value: '02', label: 'Luty' },
    { value: '03', label: 'Marzec' },
    { value: '04', label: 'Kwiecień' },
    { value: '05', label: 'Maj' },
    { value: '06', label: 'Czerwiec' },
    { value: '07', label: 'Lipiec' },
    { value: '08', label: 'Sierpień' },
    { value: '09', label: 'Wrzesień' },
    { value: '10', label: 'Październik' },
    { value: '11', label: 'Listopad' },
    { value: '12', label: 'Grudzień' },
  ];

  return (
    <div className="bg-white dark:bg-romantic-dark-card p-3 md:p-4 rounded-2xl shadow-sm border border-romantic-accent/5 mb-8 flex flex-col md:flex-row gap-3 md:gap-4 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-romantic-muted" />
        <input
          type="text"
          placeholder="Szukaj wspomnień..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-romantic-bg/30 dark:bg-black/20 rounded-xl border border-transparent focus:border-romantic-accent/20 outline-none transition-all text-sm"
        />
        {searchQuery && (
          <button 
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-romantic-accent" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
        <div className="relative flex-1 min-w-[120px]">
          <SortDesc className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-romantic-muted pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'event' | 'upload')}
            className="w-full pl-10 pr-8 py-2 bg-romantic-bg/30 dark:bg-black/20 rounded-xl border border-transparent focus:border-romantic-accent/20 outline-none transition-all text-xs md:text-sm appearance-none cursor-pointer"
          >
            <option value="event" className="dark:bg-romantic-dark-card">Data zdjęcia</option>
            <option value="upload" className="dark:bg-romantic-dark-card">Data dodania</option>
          </select>
        </div>

        <div className="relative flex-1 min-w-[120px]">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-romantic-muted pointer-events-none" />
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-romantic-bg/30 dark:bg-black/20 rounded-xl border border-transparent focus:border-romantic-accent/20 outline-none transition-all text-xs md:text-sm appearance-none cursor-pointer"
          >
            <option value="" className="dark:bg-romantic-dark-card">Wszystkie lata</option>
            {availableYears.sort((a, b) => b.localeCompare(a)).map(year => (
              <option key={year} value={year} className="dark:bg-romantic-dark-card">{year}</option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 min-w-[120px]">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-romantic-muted pointer-events-none" />
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-romantic-bg/30 dark:bg-black/20 rounded-xl border border-transparent focus:border-romantic-accent/20 outline-none transition-all text-xs md:text-sm appearance-none cursor-pointer"
          >
            {months.map(month => (
              <option key={month.value} value={month.value} className="dark:bg-romantic-dark-card">{month.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
