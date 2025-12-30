"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type JatuhTempoFilterProps = {
  selectedMonth: string | null;
  selectedYear: string | null;
  onMonthChange: (month: string | null) => void;
  onYearChange: (year: string | null) => void;
};

const months = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export function JatuhTempoFilter({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: JatuhTempoFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mb-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
        Jatuh Tempo Monitor
      </h3>
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex-1 w-full">
          <Label htmlFor="month-select" className="text-sm font-medium text-gray-700">
            Bulan
          </Label>
          <Select
            value={selectedMonth || "all"}
            onValueChange={(value) => onMonthChange(value === "all" ? null : value)}
          >
            <SelectTrigger id="month-select" className="mt-1.5 w-full">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bulan</SelectItem>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 w-full">
          <Label htmlFor="year-select" className="text-sm font-medium text-gray-700">
            Tahun
          </Label>
          <Select
            value={selectedYear || "all"}
            onValueChange={(value) => onYearChange(value === "all" ? null : value)}
          >
            <SelectTrigger id="year-select" className="mt-1.5 w-full">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tahun</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

