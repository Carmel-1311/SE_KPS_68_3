import * as patientService from "@/services/patientService";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { handleError } from "@/utils/errorHandler";
import * as res from "@/utils/responseFormatter";

export async function GET(request: Request) {
  try {
    const user = getCurrentUser(request);
    if (!user) return res.error(401, "AUTH-001", "validation fail", "VALIDATION")
    requireRole(user.role, ["staff", "dentist"]);
    const data = await patientService.listPatients(10, 1);
    return res.ok(data);
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function POST(request: Request) {
  try {
    const user = getCurrentUser(request);
    if (!user) return res.error(401, "AUTH-001", "validation fail", "VALIDATION")
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
