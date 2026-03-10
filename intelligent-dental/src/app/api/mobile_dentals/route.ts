import { NextRequest, NextResponse } from "next/server";
import { getCurrentCompanyId } from "@/mock/mockUser"
import { mobileDentalStore, MobileDental } from "@/mock/mockMobileDental";

const store = mobileDentalStore;
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    const result = companyId
        ? store.filter(item => item.company_id === Number(companyId))
        : store;

    return NextResponse.json({ data: result });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const count = Number(body.count);

        if (!body.date || !count || !body.address) {
            return NextResponse.json(
                {
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Missing required fields: date, count, address",
                        traceId: crypto.randomUUID(),
                    },
                },
                { status: 400 }
            );
        }

        const newRecord: MobileDental = {
            mobile_dental_id:
                store.length > 0
                    ? Math.max(...store.map(m => m.mobile_dental_id)) + 1
                    : 1,
            company_id: getCurrentCompanyId() ?? 1,
            date: body.date,
            count,
            status: "request",
            address: body.address,
        };

        store.push(newRecord);

        return NextResponse.json(
            { data: newRecord },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            {
                error: {
                    code: "VAL-001",
                    message: "Invalid request body",
                    traceId: crypto.randomUUID(),
                },
            },
            { status: 400 }
        );
    }
}
