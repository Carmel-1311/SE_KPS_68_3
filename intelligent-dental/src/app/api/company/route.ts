import * as companyService from "@/services/companyService";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { handleError } from "@/utils/errorHandler";
import * as res from "@/utils/responseFormatter";

export async function GET(req:Request) {
  try {
    const user = getCurrentUser(req);
    if (!user) return res.error(401, "AUTH-001", "validation fail", "VALIDATION")
    requireRole(user.role, ["staff", "company"]);

    const result = await companyService.listCompanies();
    return res.ok(result);
  } catch (err: unknown) {
    return handleError(err);
  }
}
