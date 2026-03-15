import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

type UpdateStaffBody = {
  first_name?: string;
  last_name?: string;
  birthday?: string;
  email?: string;
  phone?: string;
  license_number?: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function getStaffByIdController(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const staffId = Number(id);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json({ message: "Invalid staff id" }, { status: 400 });
    }

    const staff = await prisma.staff.findUnique({
      where: { staff_id: staffId },
      select: {
        staff_id: true,
        first_name: true,
        last_name: true,
        email: true
      }
    });

    if (!staff) {
      return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        data: {
          id: staff.staff_id,
          name: `${staff.first_name ?? ""} ${staff.last_name ?? ""}`.trim(),
          email: staff.email ?? ""
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/staffs/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function updateStaffByIdController(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const staffId = Number(id);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json({ message: "Invalid staff id" }, { status: 400 });
    }

    const body = (await request.json()) as UpdateStaffBody;
    const firstName = body.first_name?.trim();
    const lastName = body.last_name?.trim();
    const birthdayRaw = body.birthday?.trim();
    const email = body.email?.trim();
    const phone = body.phone?.trim();
    const licenseNumber = body.license_number?.trim() || null;

    if (!firstName || !lastName || !birthdayRaw || !email || !phone) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const birthday = new Date(birthdayRaw);
    if (Number.isNaN(birthday.getTime())) {
      return NextResponse.json(
        { message: "Invalid birthday format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const existing = await prisma.staff.findUnique({
      where: { staff_id: staffId },
      select: { staff_id: true }
    });

    if (!existing) {
      return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }

    const duplicate = await prisma.staff.findFirst({
      where: {
        staff_id: { not: staffId },
        OR: [{ email }, { phone }]
      },
      select: { staff_id: true }
    });

    if (duplicate) {
      return NextResponse.json(
        { message: "Staff with this email or phone already exists" },
        { status: 409 }
      );
    }

    const updated = await prisma.staff.update({
      where: { staff_id: staffId },
      data: {
        first_name: firstName,
        last_name: lastName,
        birthday,
        email,
        phone,
        license_number: licenseNumber
      },
      select: {
        staff_id: true,
        first_name: true,
        last_name: true,
        email: true
      }
    });

    return NextResponse.json(
      {
        data: {
          id: updated.staff_id,
          name: `${updated.first_name ?? ""} ${updated.last_name ?? ""}`.trim(),
          email: updated.email ?? ""
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/staffs/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
