import { NextResponse } from "next/server";
import * as companyService from "@/services/companyService";
import { AppError } from "@/utils/AppError";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";

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
      return NextResponse.json(
        { message: "Invalid company id" },
        { status: 400 }
      );
    }

    const company = await companyService.getCompanyById(companyId);

    return NextResponse.json({ data: company }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("GET /api/company/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
