import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import * as paMo from "@/services/patient_in_mobileServicr"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const mobile_id = parseInt(id);
        const user = getCurrentUser()

        requireRole(user.role, ["staff", "company"])

        const { searchParams } = new URL(request.url)
        const page = Number(searchParams.get("page")) || 1
        const limit = Number(searchParams.get("limit")) || 10

        const result = await paMo.getAllByMobile(
            user,
            mobile_id,
            page,
            limit
        )

        return res.okList(result.data, {
            page,
            limit,
            total: result.total
        })
    } catch (err: any) {
        return handleError(err)
    }
}

export async function POST(request: Request) {
    try {
        const user = getCurrentUser()
        requireRole(user.role, ["staff", "company"])
        const body = await request.json()
        const newSchedule = await paMo.createPatients(user, body)
        return res.created(newSchedule)
    } catch (err: any) {
        return handleError(err)
    }
}