import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

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
    const { id } = await params;
    const patientId = Number(id);

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return NextResponse.json({ message: "Invalid patient id" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { patient_id: patientId },
      select: {
        patient_id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        birthday: true,
        allergy: true
      }
    });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        data: {
          id: patient.patient_id,
          name: `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim(),
          email: patient.email ?? "",
          phone: patient.phone ?? "",
          birthday: patient.birthday ? patient.birthday.toISOString().slice(0, 10) : null,
          allergy: patient.allergy ?? ""
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/patients/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
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

    if (!["active", "inactive"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status. Allowed values: active, inactive" },
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

    const existing = await prisma.patient.findUnique({
      where: { patient_id: patientId },
      select: { patient_id: true }
    });

    if (!existing) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    const duplicate = await prisma.patient.findFirst({
      where: {
        patient_id: { not: patientId },
        OR: [{ email }, { phone }]
      },
      select: { patient_id: true }
    });

    if (duplicate) {
      return NextResponse.json(
        { message: "Patient with this email or phone already exists" },
        { status: 409 }
      );
    }

    const updated = await prisma.patient.update({
      where: { patient_id: patientId },
      data: {
        first_name: firstName,
        last_name: lastName,
        birthday,
        allergy,
        email,
        phone,
        status: status as "active" | "inactive"
      },
      select: {
        patient_id: true,
        first_name: true,
        last_name: true,
        email: true,
        birthday: true,
        phone: true,
        allergy: true
      }
    });

    return NextResponse.json(
      {
        data: {
          id: updated.patient_id,
          name: `${updated.first_name ?? ""} ${updated.last_name ?? ""}`.trim(),
          email: updated.email ?? "",
          birthday: updated.birthday ? updated.birthday.toISOString().slice(0, 10) : null,
          phone: updated.phone ?? "",
          allergy: updated.allergy ?? ""
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/patients/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
