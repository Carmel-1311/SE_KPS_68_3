import * as patientService from "@/services/patientService";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { handleError } from "@/utils/errorHandler";
import * as res from "@/utils/responseFormatter";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const user = getCurrentUser();
    requireRole(user.role, ["staff", "dentist"]);

    const { id } = await params;
    const patientId = Number(id);

    if (!Number.isInteger(patientId) || patientId <= 0) {
      throw new Error("Invalid patient id");
    }

    const patient = await patientService.getPatientById(patientId);

    return res.ok(patient);
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const user = getCurrentUser();
    requireRole(user.role, ["staff", "dentist"]);

    const { id } = await params;
    const patientId = Number(id);

    if (!Number.isInteger(patientId) || patientId <= 0) {
      throw new Error("Invalid patient id");
    }

    const body = await request.json();
    const updated = await patientService.updatePatient(patientId, {
      ...body,
      birthday: body.birthday,
      status: body.status || "active"
    });

    return res.ok(updated);
  } catch (err: unknown) {
    return handleError(err);
  }
}
