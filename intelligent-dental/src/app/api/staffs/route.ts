import * as staffService from "@/services/staffService";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { handleError } from "@/utils/errorHandler";
import * as res from "@/utils/responseFormatter";

export async function GET(request: Request) {
  try {
    const user = getCurrentUser(request);
    if (!user)
      return res.error(401, "AUTH-001", "validation fail", "VALIDATION");
    requireRole(user.role, ["staff", "company"]);
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;

    const data = await staffService.listStaffs(limit, page);
    return res.okList(data.data, { page, limit, total: data.total });
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function POST(request: Request) {
  try {
    const user = getCurrentUser(request);
    if (!user)
      return res.error(401, "AUTH-001", "validation fail", "VALIDATION");
    requireRole(user.role, ["staff", "company"]);

    const body = await request.json();
    const created = await staffService.createStaff({
      ...body,
      birthday: body.birthday,
    });

    return res.created(created);
  } catch (err: unknown) {
    return handleError(err);
  }
}
