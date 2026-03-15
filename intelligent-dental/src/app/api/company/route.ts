import * as companyService from "@/services/companyService";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { handleError } from "@/utils/errorHandler";
import * as res from "@/utils/responseFormatter";

export async function GET() {
  try {
    const user = getCurrentUser();
    requireRole(user.role, ["staff", "company"]);

    const result = await companyService.listCompanies();
    return res.ok(result);
  } catch (err: unknown) {
    return handleError(err);
  }
}
