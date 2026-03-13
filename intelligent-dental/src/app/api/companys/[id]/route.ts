import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const companyId = Number(id);

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return NextResponse.json(
        { message: "Invalid company id" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { company_id: companyId },
      select: {
        contect_name: true,
        office_name: true,
        phone: true,
        address: true,
        email: true
      }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ data: company }, { status: 200 });
  } catch (error) {
    console.error("GET /api/company/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
