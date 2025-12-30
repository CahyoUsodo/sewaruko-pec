"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, X, FileText } from "lucide-react";
import type { RukoLease } from "./rukolease-table";
import { formatNumberWithSeparator, parseNumberFromSeparator, formatCurrency } from "@/lib/utils/dateUtils";

type RukoLeaseFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<RukoLease, "id" | "createdAt" | "updatedAt">) => void;
  initialData?: RukoLease | null;
};

const regions = [
  "Balaraja",
  "Bekasi",
  "Cengkareng",
  "Ciledug",
  "Cipondoh",
  "Depok",
  "Kalideres",
  "Pamulang",
  "Tangerang",
];

export function RukoLeaseForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: RukoLeaseFormProps) {
  const [formData, setFormData] = React.useState({
    region: "",
    branchName: "",
    address: "",
    googleMapsUrl: "",
    paymentStatus: "",
    totalRent: "",
    startDate: "",
    endDate: "",
    personInCharge: "",
    contactPerson: "",
    mouUrl: "",
  });
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const STORAGE_KEY = "rukolease_form_draft";

  // Load from localStorage on mount or when dialog opens
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        region: initialData.region,
        branchName: initialData.branchName,
        address: initialData.address,
        googleMapsUrl: initialData.googleMapsUrl,
        paymentStatus: initialData.paymentStatus,
        totalRent: formatNumberWithSeparator(initialData.totalRent),
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split("T")[0]
          : "",
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().split("T")[0]
          : "",
        personInCharge: initialData.personInCharge,
        contactPerson: initialData.contactPerson,
        mouUrl: initialData.mouUrl || "",
      });
      if (initialData.mouUrl && initialData.mouUrl.startsWith("/uploads/")) {
        setUploadPreview(initialData.mouUrl);
      }
      // Clear draft when editing
      localStorage.removeItem(STORAGE_KEY);
    } else if (open) {
      // Load draft from localStorage when opening new form
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const savedData = JSON.parse(saved);
          // Check if draft is not too old (24 hours)
          const savedTime = savedData.timestamp || 0;
          const now = Date.now();
          if (now - savedTime < 24 * 60 * 60 * 1000) {
            setFormData(savedData.data);
            if (savedData.mouUrl && savedData.mouUrl.startsWith("/uploads/")) {
              setUploadPreview(savedData.mouUrl);
            }
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch (e) {
          console.error("Error loading draft:", e);
        }
      }
    }
    setUploadedFile(null);
    if (!initialData) {
      setUploadPreview(null);
    }
  }, [initialData, open]);

  // Auto-save to localStorage with debounce
  React.useEffect(() => {
    if (!open || initialData) return; // Don't save when editing or dialog closed
    
    const timer = setTimeout(() => {
      const draft = {
        data: formData,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timer);
  }, [formData, open, initialData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("File tidak didukung. Hanya gambar (JPG, PNG, GIF, WEBP) dan PDF yang diperbolehkan.");
      return;
    }

    // Validasi ukuran (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file terlalu besar. Maksimal 10MB.");
      return;
    }

    setUploadedFile(file);

    // Preview untuk gambar
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append("file", uploadedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setFormData({ ...formData, mouUrl: data.url });
      
      // Update preview dengan URL baru jika gambar
      if (uploadedFile.type.startsWith("image/")) {
        setUploadPreview(data.url);
      } else {
        setUploadPreview(null);
      }
      
      setUploadedFile(null);
      alert("File berhasil diupload!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Gagal mengupload file. Silakan coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadPreview(null);
    setFormData({ ...formData, mouUrl: "" });
  };

  const handleTotalRentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, ""); // Hanya angka
    if (value === "") {
      setFormData({ ...formData, totalRent: "" });
      return;
    }
    const formatted = formatNumberWithSeparator(value);
    setFormData({ ...formData, totalRent: formatted });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      totalRent: parseNumberFromSeparator(formData.totalRent),
      paymentStatus:
        formData.paymentStatus === "Sudah Bayar" ? "PAID" : "UNPAID",
      mouUrl: formData.mouUrl || null,
    };

    // Clear draft after successful submit
    localStorage.removeItem(STORAGE_KEY);
    
    onSubmit(submitData as any);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Don't clear draft on cancel, keep it for next time
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" preventCloseOnOutsideClick>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Ruko Lease" : "Tambah Ruko Lease"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Edit data sewa ruko yang sudah ada"
              : "Tambahkan data sewa ruko baru"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">Divisi</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) =>
                    setFormData({ ...formData, region: value })
                  }
                >
                  <SelectTrigger id="region" className="mt-1">
                    <SelectValue placeholder="Pilih Divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="branchName">Nama Cabang</Label>
                <Input
                  id="branchName"
                  value={formData.branchName}
                  onChange={(e) =>
                    setFormData({ ...formData, branchName: e.target.value })
                  }
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="googleMapsUrl">Google Maps Link (URL)</Label>
              <Input
                id="googleMapsUrl"
                type="url"
                value={formData.googleMapsUrl}
                onChange={(e) =>
                  setFormData({ ...formData, googleMapsUrl: e.target.value })
                }
                className="mt-1"
                placeholder="https://maps.google.com/..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentStatus">Status Bayar</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentStatus: value })
                  }
                >
                  <SelectTrigger id="paymentStatus" className="mt-1">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sudah Bayar">Sudah Bayar</SelectItem>
                    <SelectItem value="Belum Bayar">Belum Bayar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="totalRent">Total Sewa</Label>
                <Input
                  id="totalRent"
                  type="text"
                  value={formData.totalRent}
                  onChange={handleTotalRentChange}
                  className="mt-1"
                  placeholder="0"
                  required
                />
                {formData.totalRent && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(parseNumberFromSeparator(formData.totalRent))}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Mulai Sewa</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">Akhir Sewa</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="personInCharge">PIC</Label>
                <Input
                  id="personInCharge"
                  value={formData.personInCharge}
                  onChange={(e) =>
                    setFormData({ ...formData, personInCharge: e.target.value })
                  }
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Kontak PIC</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="mouFile">Upload MOU (Gambar atau PDF)</Label>
              <div className="mt-1 space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="mouFile"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {uploadedFile && (
                    <Button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading}
                      variant="outline"
                    >
                      {uploading ? "Uploading..." : <Upload className="h-4 w-4 mr-2" />}
                      Upload
                    </Button>
                  )}
                </div>
                
                {uploadPreview && (
                  <div className="relative border rounded-md p-3 bg-gray-50">
                    <div className="flex items-start gap-3">
                      {uploadPreview.startsWith("data:image") || 
                       (uploadPreview.startsWith("/uploads/") && uploadPreview.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                        <img
                          src={uploadPreview}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-red-100 rounded border flex items-center justify-center">
                          <FileText className="h-10 w-10 text-red-600" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {uploadedFile ? "File dipilih" : "File siap diupload"}
                        </p>
                        <p className="text-sm text-gray-600 break-all">
                          {uploadedFile?.name || uploadPreview}
                        </p>
                        {uploadedFile && (
                          <p className="text-xs text-gray-500 mt-1">
                            Klik tombol Upload untuk menyimpan file
                          </p>
                        )}
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="flex-shrink-0"
                        title="Hapus file"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {formData.mouUrl && !uploadPreview && (
                  <div className="relative border rounded-md p-3 bg-gray-50">
                    <div className="flex items-start gap-3">
                      {/* Preview berdasarkan tipe file */}
                      {formData.mouUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
                       formData.mouUrl.includes('image') ? (
                        <img
                          src={formData.mouUrl}
                          alt="MOU Preview"
                          className="w-24 h-24 object-cover rounded border"
                          onError={(e) => {
                            // Fallback jika gambar gagal dimuat
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : formData.mouUrl.match(/\.pdf$/i) || formData.mouUrl.includes('pdf') ? (
                        <div className="w-24 h-24 bg-red-100 rounded border flex items-center justify-center">
                          <FileText className="h-10 w-10 text-red-600" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded border flex items-center justify-center">
                          <FileText className="h-10 w-10 text-gray-500" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 mb-1">File MOU Terupload</p>
                        <a 
                          href={formData.mouUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-blue-600 hover:underline break-all"
                        >
                          {formData.mouUrl.length > 50 
                            ? formData.mouUrl.substring(0, 50) + '...' 
                            : formData.mouUrl}
                        </a>
                        <p className="text-xs text-gray-500 mt-1">
                          Klik untuk melihat file
                        </p>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="flex-shrink-0"
                        title="Hapus file"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Atau masukkan URL manual:
                </div>
                <Input
                  id="mouUrl"
                  type="url"
                  value={formData.mouUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, mouUrl: e.target.value })
                  }
                  placeholder="https://cloudinary.com/... atau kosongkan jika sudah upload file"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              {initialData ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

