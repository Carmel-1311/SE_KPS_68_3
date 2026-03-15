import * as map from "@/app/mappers/inspection_record.mapper"
import * as repo from "@/repositories/inspection_recordRepository"
import { AppError } from "@/utils/AppError"
import { UpdateInspectionRecordInput, CreateInspectionRecordInput } from "@/app/mappers/inspection_record.mapper"

export async function getAllInspectionRecordByUser(
    user: { id: number, role: string },
    patient_id: number | null,
    page: number,
    limit: number
) {

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
        data: map.inspectionRecordMap.toResponseList(result.data),
        total: result.total
    }
}

export async function getInspectionRecordById(id: number)
    : Promise<ReturnType<typeof map.inspectionRecordMap.toResponse>> {

    const Medical = await repo.findMedicalRecordById(id)

    if (!Medical) {
        throw new AppError(404, "SCHED-001", "inspection record not found", "NOT_FOUND")
    }

    return map.inspectionRecordMap.toResponse(Medical)
}

export async function createInspectionRecord(data: CreateInspectionRecordInput) {
    const Medical = await repo.createMedicalRecord(map.inspectionRecordMap.toCreateInput(data))
    return getInspectionRecordById(Medical.inspection_record_id)
}

export async function updateInspectionRecord(id: number, data: UpdateInspectionRecordInput) {

    const existingMedical = await repo.findMedicalRecordById(id)
    if (!existingMedical) {
        throw new AppError(404, "SCHED-001", "inspection record not found", "NOT_FOUND")
    }
    const updatedMedical = await repo.updateMedicalRecord(id, map.inspectionRecordMap.toUpdateInput(data))
    return getInspectionRecordById(updatedMedical.inspection_record_id)
}

export async function deleteInspectionRecord(id: number) {
    // Check if Medical exists before deleting to provide meaningful error message
    const existingMedical = await repo.findMedicalRecordById(id)
    if (!existingMedical) {
        throw new AppError(404, "SCHED-001", "inspection record not found", "NOT_FOUND")
    }
    return repo.deleteMedicalRecord(id)
}
