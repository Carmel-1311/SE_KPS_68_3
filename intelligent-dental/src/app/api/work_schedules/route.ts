import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import * as workScheduleService from "@/services/work_scheduleService"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"

export async function GET() {
    try {
        const user = getCurrentUser()
        requireRole(user.role, ["staff", "dentist"])
        const data = await workScheduleService.getAllWorkSchedulesByUser(user)
        return res.ok(data)
    } catch (err: any) {
        return handleError(err)
    }
}

export async function POST(request: Request) {
    try {
        const user = getCurrentUser()
        requireRole(user.role, ["staff", "dentist"])
        const body = await request.json()
        const newSchedule = await workScheduleService.createWorkSchedule(body)
        return res.created(newSchedule)
    } catch (err: any) {
        return handleError(err)
    }
}