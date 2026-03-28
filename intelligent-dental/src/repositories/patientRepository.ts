import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import * as map from "@/app/mappers/patient.mapper"

export async function findPatients(skip: number, take: number) {
  return prisma.patient.findMany({
    skip,
    take,
    orderBy: { patient_id: "asc" },
    ...map.patientListQuery
  })
}

export async function countPatients() {
  return prisma.patient.count()
}

export async function findPatientById(id: number) {
  return prisma.patient.findUnique({
    where: { patient_id: id },
    ...map.patientDetailQuery
  })
}

export async function findPatientDuplicate(email: string, phone: string, excludeId?: number) {
  return prisma.patient.findFirst({
    where: {
      ...(excludeId ? { patient_id: { not: excludeId } } : {}),
      OR: [{ email }, { phone }]
    },
    select: {
      patient_id: true,
      email: true,
      phone: true
    }
  })
}

export async function createPatient(data: Prisma.patientCreateInput) {
  return prisma.patient.create({
    data,
    ...map.patientListQuery
  })
}

export async function updatePatient(id: number, data: Prisma.patientUpdateInput) {
  return prisma.patient.update({
    where: { patient_id: id },
    data,
    ...map.patientDetailQuery
  })
}
