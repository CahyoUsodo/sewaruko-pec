import { differenceInMonths, isPast, startOfToday } from "date-fns";

/**
 * Menghitung sisa waktu sewa dalam bulan
 * @param endDate Tanggal akhir sewa
 * @returns String "x Bulan lagi" atau "EXPIRED"
 */
export function calculateTimeRemaining(endDate: Date): string {
  const today = startOfToday();
  const end = new Date(endDate);
  
  if (isPast(end)) {
    return "EXPIRED";
  }
  
  const monthsRemaining = differenceInMonths(end, today);
  
  if (monthsRemaining <= 0) {
    return "EXPIRED";
  }
  
  return `${monthsRemaining} Bulan lagi`;
}

/**
 * Mendapatkan class CSS untuk conditional formatting berdasarkan sisa waktu
 * @param endDate Tanggal akhir sewa
 * @returns String class CSS untuk styling
 */
export function getTimeRemainingColor(endDate: Date): string {
  const today = startOfToday();
  const end = new Date(endDate);
  
  if (isPast(end)) {
    return "text-red-600 font-bold";
  }
  
  const monthsRemaining = differenceInMonths(end, today);
  
  if (monthsRemaining < 2) {
    return "text-red-600 font-bold";
  }
  
  if (monthsRemaining < 6) {
    return "text-orange-500";
  }
  
  return "text-foreground";
}

/**
 * Mengecek apakah sewa sudah expired
 * @param endDate Tanggal akhir sewa
 * @returns Boolean true jika expired
 */
export function isExpired(endDate: Date): boolean {
  const today = startOfToday();
  const end = new Date(endDate);
  return isPast(end);
}

/**
 * Format tanggal ke format Indonesia
 * @param date Tanggal yang akan diformat
 * @returns String tanggal dalam format "DD MMMM YYYY"
 */
export function formatDateIndonesia(date: Date): string {
  const d = new Date(date);
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
}

/**
 * Format currency ke Rupiah
 * @param amount Jumlah uang
 * @returns String dalam format "Rp x.xxx.xxx"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number dengan pemisah ribuan (tanpa Rp)
 * @param value String atau number
 * @returns String dengan format "x.xxx.xxx"
 */
export function formatNumberWithSeparator(value: string | number): string {
  const numValue = typeof value === "string" ? value.replace(/\./g, "") : value;
  if (!numValue || numValue === "0") return "";
  return new Intl.NumberFormat("id-ID").format(Number(numValue));
}

/**
 * Parse string dengan pemisah menjadi number
 * @param value String dengan format "x.xxx.xxx"
 * @returns Number
 */
export function parseNumberFromSeparator(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/\./g, "");
  return parseFloat(cleaned) || 0;
}

