import { Prisma } from "@prisma/client"
import * as map from "@/app/mappers/inspection_record.mapper"
import { prisma } from "@/utils/prisma"

export async function findAllMedicalRecords() {
    return prisma.inspection_record.findMany(map.inspectionRecordQuery)
}


export async function findMedicalRecordsByPatientId(
  patientId: number,
  skip: number,
  limit: number
) {

  const [data, total] = await Promise.all([
    prisma.inspection_record.findMany({
      where: {patient_id: patientId },
      skip,
      take: limit,
      ...map.inspectionRecordQuery
    }),
    prisma.inspection_record.count({
      where: {patient_id: patientId }
    })
  ])

  return { data, total }
}
export async function createMedicalRecord(data: Prisma.inspection_recordCreateInput) {
    return prisma.inspection_record.create({ data, ...map.inspectionRecordQuery })
}

export async function updateMedicalRecord(id: number, data: Prisma.inspection_recordUpdateInput) {
    return prisma.inspection_record.update({
        where: { inspection_record_id: id },
        data,
        ...map.inspectionRecordQuery
    })
}

export async function deleteMedicalRecord(id: number) {
    return prisma.inspection_record.delete({
        where: { inspection_record_id: id }
    })
}

export async function findMedicalRecordById(id: number) {
    return prisma.inspection_record.findUnique({
        where: { inspection_record_id: id },
        ...map.inspectionRecordQuery
    })  
}
