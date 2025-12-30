"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RukoLeaseTable, type RukoLease } from "@/components/rukolease-table";
import { JatuhTempoFilter } from "@/components/jatuh-tempo-filter";
import { RukoLeaseForm } from "@/components/rukolease-form";

export default function Home() {
  const [data, setData] = React.useState<RukoLease[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedMonth, setSelectedMonth] = React.useState<string | null>(null);
  const [selectedYear, setSelectedYear] = React.useState<string | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingLease, setEditingLease] = React.useState<RukoLease | null>(
    null
  );

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedMonth) params.append("month", selectedMonth);
      if (selectedYear) params.append("year", selectedYear);

      const url = `/api/rukoleases${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditingLease(null);
    setFormOpen(true);
  };

  const handleEdit = (lease: RukoLease) => {
    setEditingLease(lease);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/rukoleases?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      fetchData();
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("Gagal menghapus data");
    }
  };

  const handleFormSubmit = async (
    formData: Omit<RukoLease, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const url = "/api/rukoleases";
      const method = editingLease ? "PUT" : "POST";
      const body = editingLease
        ? { ...formData, id: editingLease.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to save data");

      fetchData();
      setFormOpen(false);
      setEditingLease(null);
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Gagal menyimpan data");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="PEC Logo"
                  width={80}
                  height={80}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Management Sewa Ruko PEC
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                  Dashboard internal untuk management Data Sewa Ruko
                </p>
              </div>
            </div>
            <Button 
              onClick={handleAdd}
              variant="orange"
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Tambah Data</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </div>
        </div>

        <JatuhTempoFilter
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
              <p className="text-gray-600">Memuat data...</p>
            </div>
          </div>
        ) : (
          <RukoLeaseTable
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <RukoLeaseForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleFormSubmit}
          initialData={editingLease}
        />
      </div>
    </main>
  );
}
