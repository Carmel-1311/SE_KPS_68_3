import { NextResponse } from "next/server";
import * as staffService from "@/services/staffService";
import { AppError } from "@/utils/AppError";

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

    const staff = await staffService.getStaffById(staffId);

    return NextResponse.json({ data: staff }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
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

    const updated = await staffService.updateStaffById(staffId, {
      first_name: firstName,
      last_name: lastName,
      birthday,
      email,
      phone,
      license_number: licenseNumber
    });

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("PUT /api/staffs/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
