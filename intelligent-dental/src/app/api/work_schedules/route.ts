import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import * as workScheduleService from "@/services/work_scheduleService";
import { handleError } from "@/utils/errorHandler";
import * as res from "@/utils/responseFormatter";

export async function GET(request: Request) {
  try {
    const user = getCurrentUser(request);
    if (!user)
      return res.error(401, "AUTH-001", "validation fail", "VALIDATION");
    requireRole(user.role, ["staff", "dentist"]);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const result = await workScheduleService.getAllWorkSchedulesByUser(
      user,
      page,
      limit,
    );

    return res.okList(result.data, {
      page,
      limit,
      total: result.total,
    });
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function POST(request: Request) {
  try {
    const user = getCurrentUser(request);
    if (!user)
      return res.error(401, "AUTH-001", "validation fail", "VALIDATION");
    requireRole(user.role, ["staff", "dentist"]);
    const body = await request.json();
    const newSchedule = await workScheduleService.createWorkSchedule(body);
    return res.created(newSchedule);
  } catch (err: unknown) {
    return handleError(err);
  }
}
