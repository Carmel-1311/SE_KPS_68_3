import { NextResponse } from "next/server";
import * as companyService from "@/services/companyService";
import { AppError } from "@/utils/AppError";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";

export async function GET() {
  try {
    const user = getCurrentUser();
    requireRole(user.role, ["staff", "company"]);

    const result = await companyService.listCompanies();

    return NextResponse.json(
      {
        data: result
      },
      { status: 200 }
    );

  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("GET /api/company error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
