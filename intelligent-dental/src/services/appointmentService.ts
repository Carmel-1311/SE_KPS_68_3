import * as repo from "@/repositories/appointmentRepository"
import * as map from "@/app/mappers/appointment.mapper"
import { AppError } from "@/utils/AppError"
import { AppointmentResponseDTO, CreateAppointmentDTO, UpdateAppointmentDTO } from "@/dtos/appointment.dto"
import { getFreeDentist } from "./dentistService"

export async function getAppointmentById(id: number): Promise<AppointmentResponseDTO> {
    const appointment = await repo.findAppointmentById(id)

    if (!appointment) {
        throw new AppError(404, "APPT-001", "Appointment not found", "NOT_FOUND")
    }

    return map.toAppointmentResponse(appointment)
}

export async function getAllAppointments(): Promise<AppointmentResponseDTO[]> {
    const appointments = await repo.findAllAppointments()

    return map.toAppointmentResponseList(appointments);
}

export async function createAppointment(
    data: CreateAppointmentDTO
): Promise<AppointmentResponseDTO> {
    const freeDentist = await getFreeDentist(data.appointment_date, data.appointment_time);

    if (!freeDentist) {
        throw new AppError(409, "USER-002", "No available dentist for the selected time", "BUSINESS")
    }

    const mergedData = {
    ...data,
    staff_id: freeDentist.staff_id
  }

    const appointment = await repo.createAppointment(map.toCreateAppointmentInput(mergedData))
    return getAppointmentById(appointment.appointment_id)
}

export async function updateAppointment(
    id: number,
    data: Partial<UpdateAppointmentDTO>)
    : Promise<AppointmentResponseDTO> {
    const appointment = await repo.findAppointmentById(id)

    if (!appointment) {
        throw new AppError(404, "APPT-001", "Appointment not found", "NOT_FOUND")
    }

    await repo.updateAppointment(id, map.toUpdateAppointmentInput(data))
    return getAppointmentById(id)
}

export async function deleteAppointment(id: number): Promise<void> {
    const appointment = await repo.findAppointmentById(id)

    if (!appointment) {
        throw new AppError(404, "APPT-001", "Appointment not found", "NOT_FOUND")
    }

    await repo.deleteAppointment(id)
}