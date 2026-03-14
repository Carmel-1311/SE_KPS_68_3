import { Prisma } from "@prisma/client"
import * as map from "@/app/mappers/inspection_record.mapper"
import { prisma } from "@/utils/prisma"

export async function findAllMedicalRecords() {
    return prisma.inspection_record.findMany(map.inspectionRecordQuery)
}

export async function findMedicalRecordsByPatientId(patient_id: number) {
  return prisma.inspection_record.findMany({
    where: { patient_id: patient_id },
    ...map.inspectionRecordQuery
  })
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
