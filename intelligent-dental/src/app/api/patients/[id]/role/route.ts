import * as patientService from "@/services/patientService"
import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const user = getCurrentUser(request)
    if (!user) return res.error(401, "AUTH-001", "validation fail", "VALIDATION")
    requireRole(user.role, ["staff"])

    const { id } = await params
    const patientId = Number(id)

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return res.error(400, "PAT-001", "Invalid patient id", "VALIDATION")
    }

    const body = (await request.json()) as {
      role?: string
      license_number?: string | null
      prefix?: string | null
    }

    const result = await patientService.transferPatientToStaff(patientId, body)
    return res.ok(result)
  } catch (err: unknown) {
    return handleError(err)
  }
}
