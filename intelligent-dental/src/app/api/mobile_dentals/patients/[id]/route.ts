import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import * as paMo from "@/services/patient_in_mobileServicr"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const pamobile_id = parseInt(id);
    const user = getCurrentUser(request)
    if (!user)
      return res.error(401, "AUTH-001", "validation fail", "VALIDATION")

    requireRole(user.role, ["staff", "company"])

    const body = await request.json()

    const updated = await paMo.updatePatients(
      user,
      pamobile_id,
      body
    )

    return res.ok(updated)

  } catch (err: any) {
    return handleError(err)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user)
      return res.error(401, "AUTH-001", "validation fail", "VALIDATION")

    requireRole(user.role, ["staff", "company"])

    const { id } = await params;
    const pamobile_id = parseInt(id);

    await paMo.deletePatients(user, pamobile_id)

    return res.noContent()

  } catch (err: any) {
    return handleError(err)
  }
}