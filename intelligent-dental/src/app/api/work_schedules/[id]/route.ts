import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import * as workScheduleService from "@/services/work_scheduleService"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"

export async function GET(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const scheduleId = parseInt(id);
        const user = getCurrentUser()
        requireRole(user.role, ["staff", "dentist"])
        const data = await workScheduleService.getWorkScheduleById(scheduleId)
        return res.ok(data)
    } catch (err: any) {
        return handleError(err)
    }
}

export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const scheduleId = parseInt(id);
        const user = getCurrentUser()
        requireRole(user.role, ["staff", "dentist"])
        const body = await request.json()
        const updatedSchedule = await workScheduleService.updateWorkSchedule(scheduleId, body)
        return res.ok(updatedSchedule)
    } catch (err: any) {
        return handleError(err)
    }
}

export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {    
    try {
        const { id } = await params;
        const scheduleId = parseInt(id);
        const user = getCurrentUser()
        requireRole(user.role, ["staff", "dentist"])
        await workScheduleService.deleteWorkSchedule(scheduleId)
        return res.noContent()
    } catch (err: any) {
        return handleError(err)
    }
}