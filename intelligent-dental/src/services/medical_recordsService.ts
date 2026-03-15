import * as map from "@/app/mappers/medical_records.mapper"
import * as repo from "@/repositories/medical_recordsRepository"
import { AppError } from "@/utils/AppError"
import { UpdateMedicalRecordInput, CreateMedicalRecordInput } from "@/app/mappers/medical_records.mapper"

export async function getAllInspectionRecordByUser(
    user: { id: number, role: string },
    patient_id: number | null,
    page: number,
    limit: number
): Promise<{
    data: ReturnType<typeof map.medicalRecordMap.toResponseList>
    total: number
}> {

    const skip = (page - 1) * limit

    const targetPatientId =
        user.role === "patient" ? user.id : patient_id

    if (!targetPatientId) {
        throw new AppError(400, "AUTH-001", "patient not found", "NOT_FOUND")
    }

    const result = await repo.findMedicalRecordsByPatientId(
        targetPatientId,
        skip,
        limit
    )

    return {
        data: map.medicalRecordMap.toResponseList(result.data),
        total: result.total
    }
}

export async function getInspectionRecordById(id: number)
    : Promise<ReturnType<typeof map.medicalRecordMap.toResponse>> {

    const Medical = await repo.findMedicalRecordById(id)

    if (!Medical) {
        throw new AppError(404, "SCHED-001", "medical record not found", "NOT_FOUND")
    }

    return map.medicalRecordMap.toResponse(Medical)
}

export async function createInspectionRecord(data: CreateMedicalRecordInput) {
    const Medical = await repo.createMedicalRecord(map.medicalRecordMap.toCreateInput(data))
    return getInspectionRecordById(Medical.examination_id)
}

export async function updateInspectionRecord(id: number, data: UpdateMedicalRecordInput) {

    const existingMedical = await repo.findMedicalRecordById(id)
    if (!existingMedical) {
        throw new AppError(404, "SCHED-001", "medical record not found", "NOT_FOUND")
    }
    const updatedMedical = await repo.updateMedicalRecord(id, map.medicalRecordMap.toUpdateInput(data))
    return getInspectionRecordById(id)
}

export async function deleteInspectionRecord(id: number) {
    // Check if Medical exists before deleting to provide meaningful error message
    const existingMedical = await repo.findMedicalRecordById(id)
    if (!existingMedical) {
        throw new AppError(404, "SCHED-001", "medical record not found", "NOT_FOUND")
    }
    return repo.deleteMedicalRecord(id)
}
