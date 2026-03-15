import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import * as inspectionService from "@/services/inspection_recordService"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"

export async function GET(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const inspection_id = parseInt(id);
        const user = getCurrentUser()
        requireRole(user.role, ["patient", "dentist"])
        const data = await inspectionService.getInspectionRecordById(inspection_id)
        return res.ok(data)
    } catch (err: any) {
        return handleError(err)
    }
}

export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const inspection_id = parseInt(id);
        const user = getCurrentUser()
        requireRole(user.role, [ "dentist"])
        const body = await request.json()
        const updatedSchedule = await inspectionService.updateInspectionRecord(inspection_id, body)
        return res.ok(updatedSchedule)
    } catch (err: any) {
        return handleError(err)
    }
}

export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {    
    try {
        const { id } = await params;
        const inspection_id = parseInt(id);
        const user = getCurrentUser()
        requireRole(user.role, ["dentist"])
        await inspectionService.deleteInspectionRecord(inspection_id)
        return res.noContent()
    } catch (err: any) {
        return handleError(err)
    }
}