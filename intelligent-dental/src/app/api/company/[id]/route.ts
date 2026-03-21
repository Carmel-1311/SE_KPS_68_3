import * as companyService from "@/services/companyService";
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
    requireRole(user.role, ["staff", "company"]);

    const { id } = await params;
    const companyId = Number(id);

    if (!Number.isInteger(companyId) || companyId <= 0) {
      throw new Error("Invalid company id");
    }

    const company = await companyService.getCompanyById(companyId);

    return res.ok(company);
  } catch (err: unknown) {
    return handleError(err);
  }
}
