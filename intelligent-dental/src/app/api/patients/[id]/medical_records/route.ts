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

        const { searchParams } = new URL(request.url)
        const page = Number(searchParams.get("page")) || 1
        const limit = Number(searchParams.get("limit")) || 10

        const data = await medicalService.getAllInspectionRecordByUser(user,medical_id,page,limit)
        return res.okList(data.data,{page,limit,total:data.total})
    } catch (err: any) {
        return handleError(err)
    }
}
