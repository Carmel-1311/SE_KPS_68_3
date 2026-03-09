import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import *  as appointmentService from "@/repositories/appointmentRepository"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"

export async function GET() {

    try {

        const user = getCurrentUser()
        requireRole(user.role, ["staff"])

        const data = await appointmentService.findAllAppointments();
        return res.ok(data)

    } catch (err: any) {

         return handleError(err)
    }
}



export async function POST(request: Request) {
    try {

        const user = getCurrentUser()
        requireRole(user.role, ["patient", "staff"])
        
        const body = await request.json()
        const newAppointment = await appointmentService.createAppointment(body)
        return res.created(newAppointment)
    } catch (err: any) {
        return handleError(err)
    }       
}

