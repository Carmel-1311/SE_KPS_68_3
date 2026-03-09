import { Prisma } from "@prisma/client"
import * as map from "@/app/mappers/appointment.mapper"
import { prisma } from "@/utils/prisma"

export async function findAllAppointments(): Promise<map.AppointmentList[]> {
  return prisma.appointment.findMany(map.appointmentListQuery)
}

export async function findAppointmentById(
  id: number
): Promise<map.AppointmentWithRelations | null> {
  return prisma.appointment.findUnique({
    where: { appointment_id: id },
    ...map.appointmentWithRelations
  })
}

export async function createAppointment(data: Prisma.appointmentCreateInput) {
  return prisma.appointment.create({data})
}

export async function updateAppointment(id: number, data: Prisma.appointmentUpdateInput) {
  return prisma.appointment.update({
    where: { appointment_id: id },
    data
  })
}

export async function deleteAppointment(id: number) {
  return prisma.appointment.delete({
    where: { appointment_id: id }
  })
} 

