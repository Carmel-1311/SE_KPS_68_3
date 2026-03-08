import { NextRequest, NextResponse } from "next/server";
import { mockMobileDentals, MobileDental } from "@/mock/mockMobileDental";

const store: MobileDental[] = [...mockMobileDentals];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    const filtered = companyId
        ? store.filter((item) => item.company_id === Number(companyId))
        : store;

    const result = filtered.map(
        ({ mobile_dental_id, company_id, date, count, status, address }) => ({
            mobile_dental_id,
            company_id,
            date,
            count,
            status,
            address,
        })
    );

    return NextResponse.json({ data: result });
}