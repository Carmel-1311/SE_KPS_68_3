import { NextResponse } from "next/server";
import {
    mockPatientsByMobileDentalId,
    PatientInMobileRecord
} from "@/mock/mockPatientInMobile";

const store = mockPatientsByMobileDentalId;

export async function POST(
    request: Request,
    { params }: { params: Promise<{ mobile_dental_id: string }> }
) {
    try {
        const { mobile_dental_id } = await params;
        const mdId = Number(mobile_dental_id);

        if (isNaN(mdId)) {
            return NextResponse.json(
                {
                    error: {
                        code: "INVALID_ID",
                        message: "mobile_dental_id must be a number",
                        traceId: crypto.randomUUID(),
                    },
                },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { first_name, last_name, birthday, phone, idcard } = body;

        if (!first_name || !last_name || !birthday || !phone || !idcard) {
            return NextResponse.json(
                {
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Missing required fields",
                        traceId: crypto.randomUUID(),
                    },
                },
                { status: 400 }
            );
        }

        const existingPatients = store[mdId] || [];
        const maxId = existingPatients.length > 0
            ? Math.max(...existingPatients.map(p => p.patient_id))
            : 0;

        const newPatient: PatientInMobileRecord = {
            patient_id: maxId + 1,
            name: `${first_name} ${last_name}`,
            birthday,
            phone,
            idcard,
        };

        if (!store[mdId]) {
            store[mdId] = [];
        }

        store[mdId].push(newPatient);

        return NextResponse.json(
            {
                data: [
                    {
                        patient_id: newPatient.patient_id,
                        name: newPatient.name,
                    },
                ],
            },
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

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ mobile_dental_id: string }> }
) {
    const { mobile_dental_id } = await params;
    const patients = store[Number(mobile_dental_id)] || [];

    const formatted = patients.map(p => ({
        patient_id: p.patient_id,
        name: p.name,
        birthday: p.birthday,
        phone: p.phone,
        idcard: p.idcard
    }));

    return NextResponse.json({ data: formatted }, { status: 200 });
}