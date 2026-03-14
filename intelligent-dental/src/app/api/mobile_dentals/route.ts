import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import * as mobileService from "@/services/mobile_dentalsService"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"

export async function GET() {
    try {
        const user = getCurrentUser()
        requireRole(user.role, ["staff", "company"])
        const data = await mobileService.getAllMobileDentalsByUser(user)
        return res.ok(data)
    } catch (err: any) {
        return handleError(err)
    }
}

export async function POST(request: Request) {
    try {
        const user = getCurrentUser()
        requireRole(user.role, ["staff", "company"])
        const body = await request.json()
        const newSchedule = await mobileService.createMobileDentals(body)
        return res.created(newSchedule)
    } catch (err: any) {
        return handleError(err)
    }
}