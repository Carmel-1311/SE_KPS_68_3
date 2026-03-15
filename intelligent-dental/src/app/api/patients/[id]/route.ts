import { NextResponse } from "next/server";
import * as patientService from "@/services/patientService";
import { AppError } from "@/utils/AppError";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdatePatientBody = {
  first_name?: string;
  last_name?: string;
  birthday?: string;
  allergy?: string;
  email?: string;
  phone?: string;
  status?: string;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const user = getCurrentUser();
    requireRole(user.role, ["staff", "dentist"]);

    const { id } = await params;
    const patientId = Number(id);

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return NextResponse.json({ message: "Invalid patient id" }, { status: 400 });
    }

    const patient = await patientService.getPatientById(patientId);

    return NextResponse.json({ data: patient }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("GET /api/patients/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const user = getCurrentUser();
    requireRole(user.role, ["staff", "dentist"]);

    const { id } = await params;
    const patientId = Number(id);

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return NextResponse.json({ message: "Invalid patient id" }, { status: 400 });
    }

    const body = (await request.json()) as UpdatePatientBody;
    const firstName = body.first_name?.trim();
    const lastName = body.last_name?.trim();
    const birthdayRaw = body.birthday?.trim();
    const allergy = body.allergy?.trim() || "";
    const email = body.email?.trim();
    const phone = body.phone?.trim();
    const status = body.status?.trim() || "active";

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

    const updated = await patientService.updatePatient(patientId, {
      first_name: firstName,
      last_name: lastName,
      birthday: birthdayRaw,
      allergy,
      email,
      phone,
      status
    });

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("PUT /api/patients/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
