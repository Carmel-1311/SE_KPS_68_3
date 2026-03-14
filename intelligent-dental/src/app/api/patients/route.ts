import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

type CreatePatientBody = {
  first_name?: string;
  last_name?: string;
  birthday?: string;
  allergy?: string;
  email?: string;
  phone?: string;
  status?: string;
  citizen_id?: string;
};

const validStatuses = new Set(["active", "inactive"]);

export async function GET(request: Request) {
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

    const patients = await prisma.patient.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { patient_id: "asc" },
      select: {
        patient_id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        birthday: true,
        allergy: true,
        status: true
      }
    });

    return NextResponse.json(
      {
        data: patients.map((patient) => ({
          id: patient.patient_id,
          first_name: patient.first_name ?? "",
          last_name: patient.last_name ?? "",
          name: `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim(),
          email: patient.email ?? "",
          phone: patient.phone ?? "",
          birthday: patient.birthday ? patient.birthday.toISOString().slice(0, 10) : null,
          allergy: patient.allergy ?? "",
          status: patient.status ?? "active"
        }))
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/patients error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePatientBody;

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

    if (!validStatuses.has(status)) {
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

    const duplicate = await prisma.patient.findFirst({
      where: {
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

    const maxPatient = await prisma.patient.aggregate({
      _max: { patient_id: true }
    });

    const created = await prisma.patient.create({
      data: {
        patient_id: (maxPatient._max.patient_id ?? 0) + 1,
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
        phone: true,
        birthday: true,
        allergy: true,
        status: true
      }
    });

    return NextResponse.json(
      {
        data: {
          id: created.patient_id,
          first_name: created.first_name ?? "",
          last_name: created.last_name ?? "",
          name: `${created.first_name ?? ""} ${created.last_name ?? ""}`.trim(),
          email: created.email ?? "",
          phone: created.phone ?? "",
          birthday: created.birthday ? created.birthday.toISOString().slice(0, 10) : null,
          allergy: created.allergy ?? "",
          status: created.status ?? "active"
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/patients error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
