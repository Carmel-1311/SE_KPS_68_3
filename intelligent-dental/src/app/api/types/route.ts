import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import * as typeService from "@/services/typesService"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"

export async function GET() {
    try {
        const user = getCurrentUser()
        requireRole(user.role, ["dentist"])
        const data = await typeService.getAllTypes()
        return res.ok(data)
    } catch (err: any) {
        return handleError(err)
    }
}