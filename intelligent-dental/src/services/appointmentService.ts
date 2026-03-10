import * as repo from "@/repositories/appointmentRepository"
import * as map from "@/app/mappers/appointment.mapper"
import { AppError } from "@/utils/AppError"
import { AppointmentResponseDTO, CreateAppointmentDTO, UpdateAppointmentDTO } from "@/dtos/appointment.dto"
import { getFreeDentist } from "./dentistService"

export async function getAppointmentsForUser(user: { id: number, role: string }) {
    // แยก Logic ตามบทบาท
    if (user.role === "patient") {
        // เช็คว่า user มีสิทธิ์เข้าถึงข้อมูลของตัวเองหรือไม่ (ในกรณีนี้คือ patient_id ต้องตรงกับ user.id)
        return  await repo.findAppointmentsByPatientId(user.id)
    }

    if (user.role === "staff" || user.role === "dentist") {
        return  await repo.findAllAppointments();
    }

    throw new AppError(403, "AUTH-003", "Access denied for this role", "AUTH");
}


export async function getAppointmentById(id: number): Promise<AppointmentResponseDTO> {
    const appointment = await repo.findAppointmentById(id)

    if (!appointment) {
        throw new AppError(404, "APPT-001", "Appointment not found", "NOT_FOUND")
    }

    return map.toAppointmentResponse(appointment)
}

export async function createAppointment(
    data: CreateAppointmentDTO
): Promise<AppointmentResponseDTO> {
    console.log("--- TEST API CALLED ---")
    const freeDentist = await getFreeDentist(data.appointment_date, data.appointment_time);

    if (!freeDentist) {
        throw new AppError(409, "USER-002", "No available dentist for the selected time", "BUSINESS")
    }
    console.log("Free dentist found:", freeDentist.staff_id);
    const mergedData = {
    ...data,
    staff_id: freeDentist.staff_id
  }

    const appointment = await repo.createAppointment(map.toCreateAppointmentInput(mergedData))
    return getAppointmentById(appointment.appointment_id)
}

export async function updateAppointment(
    id: number,
    data: Partial<UpdateAppointmentDTO>,
    user: { id: number, role: string })
    : Promise<AppointmentResponseDTO> {
        // Check if user exists before deleting to provide meaningful error message
    
    const appointment = await repo.findAppointmentById(id)

    if (!appointment) {
        throw new AppError(404, "APPT-001", "Appointment not found", "NOT_FOUND")
    }

    await repo.updateAppointment(id, map.toUpdateAppointmentInput(data))
    return getAppointmentById(id)
}

export async function deleteAppointment(id: number,
    user: { id: number, role: string }
): Promise<void> {
    // Check if user exists before deleting to provide meaningful error message

    const appointment = await repo.findAppointmentById(id)

    if (!appointment) {
        throw new AppError(404, "APPT-001", "Appointment not found", "NOT_FOUND")
    }

    await repo.deleteAppointment(id)
}