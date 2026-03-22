import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import * as inspectionService from "@/services/inspection_recordService"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"



export async function POST(request: Request) {
    try {
        const user = getCurrentUser(request)
        if (!user) return res.error(401, "AUTH-001", "validation fail", "VALIDATION")
        requireRole(user.role, ["dentist"])
        const body = await request.json()
        const newSchedule = await inspectionService.createInspectionRecord(body)
        return res.created(newSchedule)
    } catch (err: any) {
        return handleError(err)
    }
}