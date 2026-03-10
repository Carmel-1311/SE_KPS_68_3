import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

type CreateStaffBody = {
  first_name?: string;
  last_name?: string;
  birthday?: string;
  email?: string;
  phone?: string;
  license_number?: string;
  role?: string;
};

const validRoles = new Set(["staff", "dentist"]);

export async function getStaffsController(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");

    const limit = limitParam ? Number(limitParam) : 10;
    const page = pageParam ? Number(pageParam) : 1;

    if (!Number.isInteger(limit) || !Number.isInteger(page) || limit <= 0 || page <= 0) {
      return NextResponse.json(
        { message: "limit and page must be positive integers" },
        { status: 400 }
      );
    }

    const staffs = await prisma.staff.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { staff_id: "asc" },
      select: {
        staff_id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json(
      {
        data: staffs.map((staff) => ({
          id: staff.staff_id,
          name: `${staff.first_name ?? ""} ${staff.last_name ?? ""}`.trim(),
          email: staff.email ?? "",
          role: staff.role ?? ""
        }))
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/staffs error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function createStaffController(request: Request) {
  try {
    const body = (await request.json()) as CreateStaffBody;

    const firstName = body.first_name?.trim();
    const lastName = body.last_name?.trim();
    const birthdayRaw = body.birthday?.trim();
    const email = body.email?.trim();
    const phone = body.phone?.trim();
    const licenseNumber = body.license_number?.trim() || null;
    const role = body.role?.trim();

    if (!firstName || !lastName || !birthdayRaw || !email || !phone || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!validRoles.has(role)) {
      return NextResponse.json(
        { message: "Invalid role. Allowed values: staff, dentist" },
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

    const duplicate = await prisma.staff.findFirst({
      where: {
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

    const created = await prisma.staff.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        birthday,
        email,
        phone,
        license_number: licenseNumber,
        role: role as "staff" | "dentist"
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
          id: created.staff_id,
          name: `${created.first_name ?? ""} ${created.last_name ?? ""}`.trim(),
          email: created.email ?? ""
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/staffs error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
