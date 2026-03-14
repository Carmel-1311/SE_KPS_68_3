import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import * as medicalService from "@/services/medical_recordsService"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"

export async function GET(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const medical_id = parseInt(id);
        const user = getCurrentUser()
        requireRole(user.role, ["patient", "dentist"])
        const data = await medicalService.getInspectionRecordById(medical_id)
        return res.ok(data)
    } catch (err: any) {
        return handleError(err)
    }
}

export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const medical_id = parseInt(id);
        const user = getCurrentUser()
        requireRole(user.role, ["staff", "dentist"])
        const body = await request.json()
        const updatedSchedule = await medicalService.updateInspectionRecord(medical_id, body)
        return res.ok(updatedSchedule)
    } catch (err: any) {
        return handleError(err)
    }
}

export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {    
    try {
        const { id } = await params;
        const medical_id = parseInt(id);
        const user = getCurrentUser()
        requireRole(user.role, ["staff", "dentist"])
        await medicalService.deleteInspectionRecord(medical_id)
        return res.noContent()
    } catch (err: any) {
        return handleError(err)
    }
}