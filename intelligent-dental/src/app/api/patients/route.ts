import { NextResponse } from "next/server";
import * as patientService from "@/services/patientService";
import { AppError } from "@/utils/AppError";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { handleError } from "@/utils/errorHandler";
import * as res from "@/utils/responseFormatter";

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
    const user = getCurrentUser();
    requireRole(user.role, ["staff", "dentist"]);
    const data = await patientService.listPatients(10, 1);
    return res.ok(data);
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function POST(request: Request) {
  try {
    const user = getCurrentUser();
    requireRole(user.role, ["staff", "dentist"]);

    const body = await request.json();
    const created = await patientService.createPatient({
      ...body,
      birthday: body.birthday,
      status: body.status || "active"
    });
    return res.created(created);
  } catch (err: unknown) {
    return handleError(err);
  }
}
