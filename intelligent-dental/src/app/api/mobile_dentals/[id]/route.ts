import { NextResponse } from "next/server";
import { mobileDentalStore } from "@/mock/mockMobileDental";

const store = mobileDentalStore;

// GET /api/mobile_dentals/:id
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const record = store.find(
        (item) => item.mobile_dental_id === Number(id)
    );

    if (!record) {
        return NextResponse.json(
            {
                error: {
                    code: "NOT_FOUND",
                    message: "Mobile Dental request not found",
                    traceId: crypto.randomUUID(),
                },
            },
            { status: 404 }
        );
    }

    return NextResponse.json({ data: record }, { status: 200 });
}

// PUT /api/mobile_dentals/:id
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await request.json();

        if (!body.status) {
            return NextResponse.json(
                {
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Missing required field: status",
                        traceId: crypto.randomUUID(),
                    },
                },
                { status: 400 }
            );
        }

        const index = store.findIndex(
            (item) => item.mobile_dental_id === Number(id)
        );

        if (index === -1) {
            return NextResponse.json(
                {
                    error: {
                        code: "NOT_FOUND",
                        message: "Mobile Dental request not found",
                        traceId: crypto.randomUUID(),
                    },
                },
                { status: 404 }
            );
        }


        store[index] = {
            ...store[index],
            status: body.status,
        };

        return NextResponse.json(
            { data: store[index] },
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
