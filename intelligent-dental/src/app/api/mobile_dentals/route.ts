import { NextRequest, NextResponse } from "next/server";
import { mockMobileDentals, MobileDental } from "@/mock/mockMobileDental";
import { getCurrentCompanyId } from "@/mock/mockUser"

// แชร์ข้อมูลจากแหล่งเดียวกัน เพื่อให้ GET/POST/PUT ทุกที่เห็นข้อมูลชุดเดียวกัน
const store: MobileDental[] = mockMobileDentals;

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

        if (!body.date || !body.count || !body.address) {
            return NextResponse.json(
                { error: "Missing required fields" },
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
            count: Number(body.count),
            status: "request",
            address: body.address,
        };

        store.push(newRecord);

        return NextResponse.json(
            {
                data: newRecord,
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("API Error:", err);

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
