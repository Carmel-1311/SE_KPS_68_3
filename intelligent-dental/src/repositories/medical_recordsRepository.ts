import { Prisma } from "@prisma/client"
import * as map from "@/app/mappers/medical_records.mapper"
import { prisma } from "@/utils/prisma"

export async function findAllMedicalRecords() {
    return prisma.medical_records.findMany(map.medicalRecordQuery)
}

export async function findMedicalRecordsByPatientId(patient_id: number,skip: number,
  limit: number) {
  const [data, total] = await Promise.all([
    prisma.medical_records.findMany({
      where: { patient_id },
      skip,
      take: limit,
      ...map.medicalRecordQuery
    }),
    prisma.medical_records.count({
      where: { patient_id }
    })
  ])

  return { data, total }
}
export async function createMedicalRecord(data: Prisma.medical_recordsCreateInput) {
    return prisma.medical_records.create({ data, ...map.medicalRecordQuery })
}

export async function updateMedicalRecord(id: number, data: Prisma.medical_recordsUpdateInput) {
    return prisma.medical_records.update({
        where: { examination_id: id },
        data,
        ...map.medicalRecordQuery
    })
}

export async function deleteMedicalRecord(id: number) {
    return prisma.medical_records.delete({
        where: { examination_id: id }
    })
}

export async function findMedicalRecordById(id: number) {
    return prisma.medical_records.findUnique({
        where: { examination_id: id },
        ...map.medicalRecordQuery
    })  
}
