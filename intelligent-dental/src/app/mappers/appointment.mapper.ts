import { Prisma } from "@prisma/client"
import {
  AppointmentResponseDTO,
  CreateAppointmentDTO,
  UpdateAppointmentDTO
} from "@/dtos/appointment.dto"
import { removeUndefined } from "@/utils/object.util"

export const appointmentWithRelations =
  Prisma.validator<Prisma.appointmentDefaultArgs>()({
    include: {
      patient: {
        select: {
          patient_id: true,
          first_name: true,
          last_name: true
        }
      },
      staff: {
        select: {
          staff_id: true,
          first_name: true,
          last_name: true
        }
      },
      medical_records: {
        select: {
          examination_id: true,
          examination_date: true,
          examination_history: true,
          examination_status: true,
          dental_examination_detail: {
            select: {
              dental_examination_detail_id: true,
              type: true,
              diagnosis_: true
            }
          }
        }
      },
      inspection_record: {
        select: {
          inspection_record_id: true,
          date: true,
          history: true,
          status: true
        }

      }
    }
  })
export type AppointmentWithRelations =
  Prisma.appointmentGetPayload<typeof appointmentWithRelations>

export function toAppointmentResponse(
  a: AppointmentWithRelations
): AppointmentResponseDTO {
  return {
    appointment_id: a.appointment_id,
    patient: {
      id: a.patient.patient_id,
      name: `${a.patient.first_name} ${a.patient.last_name}`
    },
    staff: a.staff
      ? {
        id: a.staff.staff_id,
        name: `${a.staff.first_name} ${a.staff.last_name}`
      }
      : undefined,
    appointment_date: a.appointment_date.toISOString(),
    appointment_time: a.appointment_time.toTimeString().slice(0, 5),
    type: a.type,
    status: a.status as "scheduled" | "completed" | "cancelled",
    medical_record: a.medical_records
      ? {
        id: a.medical_records.examination_id,
        date: a.medical_records.examination_date
          ? a.medical_records.examination_date.toISOString()
          : "",
        history: a.medical_records.examination_history ?? "",
        status: a.medical_records.examination_status ?? "",
        detail:
          a.medical_records.dental_examination_detail?.map(d => ({
            id: d.dental_examination_detail_id,
            diagnosis: d.diagnosis_ ?? ""
          })) ?? []
      }
      : null,

    inspection_record: a.inspection_record
      ? {
        id: a.inspection_record.inspection_record_id,
        date: a.inspection_record.date?.toISOString() ?? "",
        history: a.inspection_record.history ?? "",
        status: a.inspection_record.status ?? ""
      }
      : null
  }
}

export const appointmentListQuery =
  Prisma.validator<Prisma.appointmentDefaultArgs>()({
    include: {
      patient: {
        select: {
          patient_id: true,
          first_name: true,
          last_name: true
        }
      },
      staff: {
        select: {
          staff_id: true,
          first_name: true,
          last_name: true
        }
      },

      medical_records: {
        select: {
          examination_id: true   // เอาแค่นี้พอ
        }
      },
      inspection_record: {
        select: {
          inspection_record_id: true
        }
      }
    }
  })

export type AppointmentList =
  Prisma.appointmentGetPayload<typeof appointmentListQuery>

export function toAppointmentResponseList(
  appointments: AppointmentList[]
): AppointmentResponseDTO[] {
  return appointments.map(a => ({
    appointment_id: a.appointment_id,
    patient: {
      id: a.patient.patient_id,
      name: `${a.patient.first_name} ${a.patient.last_name}`
    },

    staff: a.staff
      ? {
        id: a.staff.staff_id,
        name: `${a.staff.first_name} ${a.staff.last_name}`
      }
      : undefined,

    appointment_date: a.appointment_date.toISOString(),
    appointment_time: a.appointment_time.toTimeString().slice(0, 5),

    type: a.type,
    status: a.status as "scheduled" | "completed" | "cancelled",

    medical_record_id: a.medical_records?.examination_id || null,
    inspection_record_id: a.inspection_record?.inspection_record_id || null
  }))
}


export function toCreateAppointmentInput(
  data: CreateAppointmentDTO
): Prisma.appointmentCreateInput {
  return {
    appointment_date: new Date(data.appointment_date),
    appointment_time: new Date(`1970-01-01T${data.appointment_time}:00Z`),
    type: data.type,
    status: data.status,
    patient: {
      connect: { patient_id: data.patient_id }
    },

    ...(data.staff_id && { staff: { connect: { staff_id: data.staff_id } } }),
  }
}


export function toUpdateAppointmentInput(
  data: UpdateAppointmentDTO
): Prisma.appointmentUpdateInput {
  return removeUndefined({
    patient_id: data.patient_id,
    staff_id: data.staff_id,
    appointment_date: data.appointment_date
      ? new Date(data.appointment_date)
      : undefined,
    appointment_time: data.appointment_time,
    type: data.type,
    status: data.status
  })
}