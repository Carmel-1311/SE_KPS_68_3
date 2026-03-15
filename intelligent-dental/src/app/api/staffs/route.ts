import { NextResponse } from "next/server";
import * as staffService from "@/services/staffService";
import { AppError } from "@/utils/AppError";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";

type CreateStaffBody = {
  first_name?: string;
  last_name?: string;
  birthday?: string;
  email?: string;
  phone?: string;
  license_number?: string;
  role?: "staff" | "dentist";
};

export async function GET(request: Request) {
  try {
    const user = getCurrentUser();
    requireRole(user.role, ["staff", "company"]);

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

    const staffs = await staffService.listStaffs(limit, page);

    return NextResponse.json(
      {
        data: staffs
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("GET /api/staffs error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = getCurrentUser();
    requireRole(user.role, ["staff", "company"]);

    const body = (await request.json()) as CreateStaffBody;

    const firstName = body.first_name?.trim();
    const lastName = body.last_name?.trim();
    const birthdayRaw = body.birthday?.trim();
    const email = body.email?.trim();
    const phone = body.phone?.trim();
    const licenseNumber = body.license_number?.trim() || null;
    const roleRaw = body.role?.trim();

    if (!firstName || !lastName || !birthdayRaw || !email || !phone || !roleRaw) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (roleRaw !== "staff" && roleRaw !== "dentist") {
      return NextResponse.json(
        { message: "Invalid role. Allowed values: staff, dentist" },
        { status: 400 }
      );
    }

    const role: "staff" | "dentist" = roleRaw;

    const birthday = new Date(birthdayRaw);
    if (Number.isNaN(birthday.getTime())) {
      return NextResponse.json(
        { message: "Invalid birthday format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const created = await staffService.createStaff({
      first_name: firstName,
      last_name: lastName,
      birthday: birthdayRaw,
      email,
      phone,
      license_number: licenseNumber,
      role
    });

    return NextResponse.json(
      {
        data: created
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("POST /api/staffs error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
