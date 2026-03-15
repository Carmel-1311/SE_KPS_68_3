import { Prisma } from "@prisma/client"
import * as map from "@/app/mappers/appointment.mapper"
import { prisma } from "@/utils/prisma"

export async function findAllAppointments(
  skip: number,
  limit: number
): Promise<{ data: map.AppointmentList[]; total: number }> {

  const [data, total] = await Promise.all([
    prisma.appointment.findMany({
      ...map.appointmentListQuery,
      skip,
      take: limit
    }),
    prisma.appointment.count()
  ])

  return { data, total }
}

export async function findAppointmentById(
  id: number
){
  return prisma.appointment.findUnique({
    where: { appointment_id: id },
    ...map.appointmentWithRelations
  })
}

export async function createAppointment(data: Prisma.appointmentCreateInput) {
  return prisma.appointment.create({data,...map.appointmentWithRelations})
}

export async function updateAppointment(id: number, data: Prisma.appointmentUpdateInput) {
  return prisma.appointment.update({
    where: { appointment_id: id },
    data,...map.appointmentWithRelations
  })
}

export async function deleteAppointment(id: number) {
  return prisma.appointment.delete({
    where: { appointment_id: id }
  })
} 

export async function findAppointmentsByPatientId(patientId: number,  skip: number,
  limit: number): Promise<{ data: map.AppointmentList[]; total: number }> {

    const [data, total] = await Promise.all([
    prisma.appointment.findMany({
      where: { patient_id: patientId },
      ...map.appointmentListQuery,
      skip,
      take: limit
    }),
    prisma.appointment.count()
  ])
  return { data, total }
}
  

