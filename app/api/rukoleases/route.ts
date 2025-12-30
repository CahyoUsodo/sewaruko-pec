import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch semua data dengan sorting default by endDate ASC
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Fetch all data first, then filter in memory for month-only filtering
    const rukoleases = await prisma.rukoLease.findMany({
      orderBy: {
        endDate: "asc", // Default sort: closest expiration first
      },
    });

    // Filter berdasarkan bulan dan/atau tahun
    let filteredData = rukoleases;

    if (month || year) {
      filteredData = rukoleases.filter((lease) => {
        const leaseEndDate = new Date(lease.endDate);
        const leaseMonth = leaseEndDate.getMonth() + 1; // getMonth() returns 0-11
        const leaseYear = leaseEndDate.getFullYear();

        // Jika hanya bulan dipilih
        if (month && !year) {
          return leaseMonth === parseInt(month);
        }

        // Jika hanya tahun dipilih
        if (!month && year) {
          return leaseYear === parseInt(year);
        }

        // Jika kedua bulan dan tahun dipilih
        if (month && year) {
          return leaseMonth === parseInt(month) && leaseYear === parseInt(year);
        }

        return true;
      });
    }

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error("Error fetching rukoleases:", error);
    return NextResponse.json(
      { error: "Failed to fetch rukoleases" },
      { status: 500 }
    );
  }
}

// POST: Create new lease
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      region,
      branchName,
      address,
      googleMapsUrl,
      paymentStatus,
      totalRent,
      startDate,
      endDate,
      personInCharge,
      contactPerson,
      mouUrl,
    } = body;

    // Validasi required fields
    if (
      !region ||
      !branchName ||
      !address ||
      !googleMapsUrl ||
      !paymentStatus ||
      totalRent === undefined ||
      !startDate ||
      !endDate ||
      !personInCharge ||
      !contactPerson
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const rukolease = await prisma.rukoLease.create({
      data: {
        region,
        branchName,
        address,
        googleMapsUrl,
        paymentStatus,
        totalRent: parseFloat(totalRent),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        personInCharge,
        contactPerson,
        mouUrl: mouUrl || null,
      },
    });

    return NextResponse.json(rukolease, { status: 201 });
  } catch (error) {
    console.error("Error creating rukolease:", error);
    return NextResponse.json(
      { error: "Failed to create rukolease" },
      { status: 500 }
    );
  }
}

// PUT: Update lease
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // Convert dates if present
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.totalRent !== undefined) {
      updateData.totalRent = parseFloat(updateData.totalRent);
    }

    const rukolease = await prisma.rukoLease.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(rukolease);
  } catch (error) {
    console.error("Error updating rukolease:", error);
    return NextResponse.json(
      { error: "Failed to update rukolease" },
      { status: 500 }
    );
  }
}

// DELETE: Delete lease
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    await prisma.rukoLease.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Rukolease deleted successfully" });
  } catch (error) {
    console.error("Error deleting rukolease:", error);
    return NextResponse.json(
      { error: "Failed to delete rukolease" },
      { status: 500 }
    );
  }
}

