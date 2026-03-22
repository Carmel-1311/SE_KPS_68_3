import * as patientService from "@/services/patientService";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { handleError } from "@/utils/errorHandler";
import * as res from "@/utils/responseFormatter";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const user = getCurrentUser(request);
    if (!user) return res.error(401, "AUTH-001", "validation fail", "VALIDATION")
    requireRole(user.role, ["staff", "dentist", "patient"]);

    const { id } = await params;
    let patientId: number;
    if (user.role === "patient") {
      patientId = user.id;
    } else {
      patientId = Number(id);
      if (!Number.isInteger(patientId) || patientId <= 0) {
        throw new Error("Invalid patient id");
      }
    }

    const patient = await patientService.getPatientById(patientId);

    return res.ok(patient);
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const user = getCurrentUser(request);
    if (!user) return res.error(401, "AUTH-001", "validation fail", "VALIDATION")
    requireRole(user.role, ["staff", "dentist", "patient"]);

    const { id } = await params;
    let patientId: number;
    if (user.role === "patient") {
      patientId = user.id;
    } else {
      patientId = Number(id);
      if (!Number.isInteger(patientId) || patientId <= 0) {
        throw new Error("Invalid patient id");
      }
    }

    const body = await request.json();
    const payload = {
      ...body,
      birthday: body.birthday,
      ...(user.role === "patient" ? {} : { status: body.status || "active" })
    };

    const updated = await patientService.updatePatient(patientId, payload);

    return res.ok(updated);
  } catch (err: unknown) {
    return handleError(err);
  }
}
