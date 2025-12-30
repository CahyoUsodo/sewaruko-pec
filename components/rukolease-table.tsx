"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ExternalLink, Eye } from "lucide-react";
import { MOUPreviewModal } from "./mou-preview-modal";
import {
  calculateTimeRemaining,
  getTimeRemainingColor,
  isExpired,
  formatDateIndonesia,
  formatCurrency,
} from "@/lib/utils/dateUtils";

export type RukoLease = {
  id: string;
  region: string;
  branchName: string;
  address: string;
  googleMapsUrl: string;
  paymentStatus: string;
  totalRent: number;
  startDate: Date | string;
  endDate: Date | string;
  personInCharge: string;
  contactPerson: string;
  mouUrl: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type RukoLeaseTableProps = {
  data: RukoLease[];
  onEdit: (lease: RukoLease) => void;
  onDelete: (id: string) => void;
};

export function RukoLeaseTable({
  data,
  onEdit,
  onDelete,
}: RukoLeaseTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "endDate",
      desc: false, // Ascending: closest expiration first
    },
  ]);
  const [mouPreviewOpen, setMouPreviewOpen] = React.useState(false);
  const [selectedMouUrl, setSelectedMouUrl] = React.useState("");
  const [selectedMouTitle, setSelectedMouTitle] = React.useState("");

  const handleViewMOU = (mouUrl: string, branchName: string) => {
    setSelectedMouUrl(mouUrl);
    setSelectedMouTitle(`MOU - ${branchName}`);
    setMouPreviewOpen(true);
  };

  const columns = React.useMemo<ColumnDef<RukoLease>[]>(
    () => [
      {
        accessorKey: "region",
        header: "Divisi",
      },
      {
        accessorKey: "branchName",
        header: "Nama Cabang",
      },
      {
        accessorKey: "address",
        header: "Alamat",
        cell: ({ row }) => {
          const address = row.original.address;
          const googleMapsUrl = row.original.googleMapsUrl;
          return (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              {address}
              <ExternalLink className="h-3 w-3" />
            </a>
          );
        },
      },
      {
        accessorKey: "paymentStatus",
        header: "Status Bayar",
        cell: ({ row }) => {
          const status = row.original.paymentStatus;
          const isPaid = status === "PAID" || status === "Sudah Bayar";
          return (
            <Badge variant={isPaid ? "success" : "destructive"}>
              {isPaid ? "Sudah Bayar" : "Belum Bayar"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "totalRent",
        header: "Total Sewa",
        cell: ({ row }) => {
          return formatCurrency(row.original.totalRent);
        },
      },
      {
        accessorKey: "startDate",
        header: "Mulai Sewa",
        cell: ({ row }) => {
          return formatDateIndonesia(new Date(row.original.startDate));
        },
      },
      {
        accessorKey: "endDate",
        header: "Akhir Sewa",
        cell: ({ row }) => {
          return formatDateIndonesia(new Date(row.original.endDate));
        },
      },
      {
        id: "sisaWaktu",
        header: "Sisa Waktu",
        cell: ({ row }) => {
          const endDate = new Date(row.original.endDate);
          const timeRemaining = calculateTimeRemaining(endDate);
          const colorClass = getTimeRemainingColor(endDate);
          const expired = isExpired(endDate);

          if (expired) {
            return <Badge variant="destructive">EXPIRED</Badge>;
          }

          return <span className={colorClass}>{timeRemaining}</span>;
        },
      },
      {
        accessorKey: "personInCharge",
        header: "PIC",
      },
      {
        accessorKey: "contactPerson",
        header: "Kontak PIC",
      },
      {
        accessorKey: "mouUrl",
        header: "MOU",
        cell: ({ row }) => {
          const mouUrl = row.original.mouUrl;
          const branchName = row.original.branchName;
          if (!mouUrl) {
            return <span className="text-muted-foreground">-</span>;
          }
          return (
            <Button
              variant="link"
              size="sm"
              className="text-blue-600 hover:underline flex items-center gap-1 p-0 h-auto"
              onClick={() => handleViewMOU(mouUrl, branchName)}
            >
              <Eye className="h-3 w-3" />
              View MOU
            </Button>
          );
        },
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(row.original)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(row.original.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-semibold text-sm text-gray-700"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-2"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b transition-colors hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-gray-500">
                  Tidak ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const lease = row.original;
            return (
              <div key={row.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{lease.branchName}</h3>
                    <p className="text-sm text-gray-600">{lease.region}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(lease)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(lease.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Alamat: </span>
                    <a
                      href={lease.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {lease.address}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Status: </span>
                    {lease.paymentStatus === "PAID" || lease.paymentStatus === "Sudah Bayar" ? (
                      <Badge variant="success">Sudah Bayar</Badge>
                    ) : (
                      <Badge variant="destructive">Belum Bayar</Badge>
                    )}
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Total Sewa: </span>
                    <span className="text-gray-900">{formatCurrency(lease.totalRent)}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Mulai Sewa: </span>
                    <span className="text-gray-900">
                      {formatDateIndonesia(new Date(lease.startDate))}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Akhir Sewa: </span>
                    <span className="text-gray-900">
                      {formatDateIndonesia(new Date(lease.endDate))}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Sisa Waktu: </span>
                    {isExpired(new Date(lease.endDate)) ? (
                      <Badge variant="destructive">EXPIRED</Badge>
                    ) : (
                      <span className={getTimeRemainingColor(new Date(lease.endDate))}>
                        {calculateTimeRemaining(new Date(lease.endDate))}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">PIC: </span>
                    <span className="text-gray-900">{lease.personInCharge}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Kontak PIC: </span>
                    <span className="text-gray-900">{lease.contactPerson}</span>
                  </div>
                  
                  {lease.mouUrl && (
                    <div>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-blue-600 hover:underline flex items-center gap-1 p-0 h-auto"
                        onClick={() => handleViewMOU(lease.mouUrl!, lease.branchName)}
                      >
                        <Eye className="h-3 w-3" />
                        View MOU
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-24 flex items-center justify-center text-gray-500">
            Tidak ada data.
          </div>
        )}
      </div>

      {/* MOU Preview Modal */}
      <MOUPreviewModal
        open={mouPreviewOpen}
        onOpenChange={setMouPreviewOpen}
        mouUrl={selectedMouUrl}
        title={selectedMouTitle}
      />
    </div>
  );
}

