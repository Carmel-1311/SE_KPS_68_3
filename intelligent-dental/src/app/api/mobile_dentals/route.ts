import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import * as mobileService from "@/services/mobile_dentalsService"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"

export async function GET(request: Request) {
    try {
        const user = getCurrentUser(request)
        if (!user) return res.error(401, "AUTH-001", "validation fail", "VALIDATION")
        requireRole(user.role, ["staff", "dentist" ,"company"])

        const { searchParams } = new URL(request.url)
        const page = Number(searchParams.get("page")) || 1
        const limit = Number(searchParams.get("limit")) || 10

        const data = await mobileService.getAllMobileDentalsByUser(user,
            page,
            limit
        )
        return res.okList(data.data,{
            page,
            limit,
            total:data.total
        })
    } catch (err: any) {
        return handleError(err)
    }
}

export async function POST(request: Request) {
    try {
        const user = getCurrentUser(request)
        if (!user) return res.error(401, "AUTH-001", "validation fail", "VALIDATION")
        requireRole(user.role, ["staff","dentist", "company"])
        const body = await request.json()
        const newSchedule = await mobileService.createMobileDentals(body)
        return res.created(newSchedule)
    } catch (err: any) {
        return handleError(err)
    }
}