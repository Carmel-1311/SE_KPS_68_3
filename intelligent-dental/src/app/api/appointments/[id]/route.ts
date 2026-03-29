export async function PATCH(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const appointmentId = parseInt(id);
        const user = getCurrentUser(request)
        if (!user) return res.error(401, "AUTH-001", "validation fail", "VALIDATION")
        requireRole(user.role, ["patient","staff","dentist"])
        const body = await request.json()
        // PATCH อนุญาตอัปเดตเฉพาะ field ที่ส่งมา
        const updatedAppointment = await appointmentService.updateAppointment(appointmentId, body, user)
        return res.ok(updatedAppointment)
    } catch (err: any) {
        return handleError(err)
    }
}
import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import * as appointmentService from "@/services/appointmentService"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"


export async function GET(request: Request,{ params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params;
        const appointmentId = parseInt(id);
        const user = getCurrentUser(request)
        if (!user) return res.error(401, "AUTH-001", "validation fail", "VALIDATION")
        requireRole(user.role, ["staff", "dentist", "patient"])
        const data = await appointmentService.getAppointmentById(appointmentId);

        return res.ok(data)
    } catch (err: any) {
        return handleError(err)
    }
}   

export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const appointmentId = parseInt(id);
        const user = getCurrentUser(request)
        if (!user) return res.error(401, "AUTH-001", "validation fail", "VALIDATION")
        requireRole(user.role, ["patient","staff","dentist"])           
        const body = await request.json()
        const updatedAppointment = await appointmentService.updateAppointment(appointmentId, body, user)
        return res.ok(updatedAppointment)
    } catch (err: any) {
        return handleError(err)
    }   
}

export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const appointmentId = parseInt(id);
        const user = getCurrentUser(request)
        if (!user) return res.error(401, "AUTH-001", "validation fail", "VALIDATION")
        requireRole(user.role, ["staff", "dentist", "patient"])
        await appointmentService.deleteAppointment(appointmentId, user)
        return res.noContent()
    } catch (err: any) {
        return handleError(err)
    }
}
