import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import * as appointmentService from "@/services/appointmentService"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"

export async function GET(req: Request) {
  try {
    const user = getCurrentUser()
    requireRole(user.role, ["staff", "dentist", "patient"])

    const { searchParams } = new URL(req.url)

    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 10

    const data = await appointmentService.getAppointmentsForUser(
      user,
      page,
      limit
    )

    return res.okList(data.data,{page,limit,total:data.total})

  } catch (err: any) {
    return handleError(err)
  }
}
export async function POST(request: Request) {
    try {

        const user = getCurrentUser()
        requireRole(user.role, ["patient", "staff"])

        const body = await request.json()
        const newAppointment = await appointmentService.createAppointment({
            ...body,
            appointment_date: body.appointment_date,
            appointment_time: body.appointment_time,
            status: body.status || "scheduled"
        })
        return res.created(newAppointment)
    } catch (err: any) {
        return handleError(err)
    }
}

