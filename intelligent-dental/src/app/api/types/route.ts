import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import * as typeService from "@/services/typesService";
import { handleError } from "@/utils/errorHandler";
import * as res from "@/utils/responseFormatter";

export async function GET(request: Request) {
  try {
    const user = getCurrentUser(request);
    if (!user)
      return res.error(401, "AUTH-001", "validation fail", "VALIDATION");
    requireRole(user.role, ["dentist"]);
    const data = await typeService.getAllTypes();
    return res.ok(data);
  } catch (err: unknown) {
    return handleError(err);
  }
}
