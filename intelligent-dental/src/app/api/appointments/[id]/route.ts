import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import *  as appointmentService from "@/repositories/appointmentRepository"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"


export async function GET(request: Request,{ params }: { params: { id: number } }) {

    try {
        const user = getCurrentUser()
        requireRole(user.role, ["staff", "dentist", "patient"])
        const data = await appointmentService.findAppointmentById(params.id);

        return res.ok(data)
    } catch (err: any) {
        return handleError(err)
    }
}   

export async function PUT(request: Request,{ params }: { params: { id: number } }) {
    try {
        const user = getCurrentUser()
        requireRole(user.role, ["patient","staff","dentist"])           
        const body = await request.json()
        const updatedAppointment = await appointmentService.updateAppointment(params.id, body)
        return res.ok(updatedAppointment)
    } catch (err: any) {
        return handleError(err)
    }   
}

export async function DELETE(request: Request,{ params }: { params: { id: number } }) {
    try {
        const user = getCurrentUser()
        requireRole(user.role, ["staff"])           
        await appointmentService.deleteAppointment(params.id)
        return res.noContent()
    } catch (err: any) {
        return handleError(err)
    }
}