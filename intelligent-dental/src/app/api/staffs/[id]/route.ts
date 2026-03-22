import * as staffService from "@/services/staffService";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { handleError } from "@/utils/errorHandler";
import * as res from "@/utils/responseFormatter";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: RouteContext) {
  try {
    const user = getCurrentUser(req);
    if (!user) return res.error(401, "AUTH-001", "validation fail", "VALIDATION")
    requireRole(user.role, ["staff", "company"]);

    const { id } = await params;
    const staffId = Number(id);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      throw new Error("Invalid staff id");
    }

    const staff = await staffService.getStaffById(staffId);

    return res.ok(staff);
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const user = getCurrentUser(request);
    if (!user) return res.error(401, "AUTH-001", "validation fail", "VALIDATION")
    requireRole(user.role, ["staff", "company"]);

    const { id } = await params;
    const staffId = Number(id);

    if (!Number.isInteger(staffId) || staffId <= 0) {
      throw new Error("Invalid staff id");
    }

    const body = await request.json();
    const updated = await staffService.updateStaffById(staffId, {
      ...body,
      birthday: body.birthday
    });

    return res.ok(updated);
  } catch (err: unknown) {
    return handleError(err);
  }
}
