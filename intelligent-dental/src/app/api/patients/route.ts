import { NextResponse } from "next/server";
import * as patientService from "@/services/patientService";
import { AppError } from "@/utils/AppError";

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

    const patients = await patientService.listPatients(limit, page);

    return NextResponse.json(
      {
        data: patients
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
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

    const birthday = new Date(birthdayRaw);
    if (Number.isNaN(birthday.getTime())) {
      return NextResponse.json(
        { message: "Invalid birthday format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const created = await patientService.createPatient({
      first_name: firstName,
      last_name: lastName,
      birthday,
      allergy,
      email,
      phone,
      status
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
    console.error("POST /api/patients error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
