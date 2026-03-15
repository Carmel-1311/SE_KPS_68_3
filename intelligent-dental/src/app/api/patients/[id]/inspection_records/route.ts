import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import * as inspectionService from "@/services/inspection_recordService"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const inspection_id = parseInt(id);

        const user = getCurrentUser()
        requireRole(user.role, ["patient", "dentist"])

        const { searchParams } = new URL(request.url)
        const page = Number(searchParams.get("page")) || 1
        const limit = Number(searchParams.get("limit")) || 10

        const data = await inspectionService.getAllInspectionRecordByUser(user, 
            inspection_id,
        page,limit
    )
        return res.okList(data.data,{page,limit,total:data.total})
    } catch (err: any) {
        return handleError(err)
    }
}
