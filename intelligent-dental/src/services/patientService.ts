import * as repo from "@/repositories/patientRepository"
import { AppError } from "@/utils/AppError"
import * as map from "@/app/mappers/patient.mapper"
import { status_user } from "@prisma/client"

const validStatuses = new Set(Object.values(status_user))

export async function listPatients(limit: number, page: number) {
  const patients = await repo.findPatients((page - 1) * limit, limit)
  return map.patientMap.toResponseList(patients)
}

export async function createPatient(data: {
  first_name: string
  last_name: string
  birthday: Date
  allergy: string
  email: string
  phone: string
  status: string
}) {
  if (!validStatuses.has(data.status as status_user)) {
    throw new AppError(400, "PAT-001", "Invalid status. Allowed values: active, inactive", "VALIDATION")
  }

  const duplicate = await repo.findPatientDuplicate(data.email, data.phone)
  if (duplicate) {
    throw new AppError(409, "PAT-002", "Patient with this email or phone already exists", "CONFLICT")
  }

  const maxPatient = await repo.getMaxPatientId()
  const created = await repo.createPatient(
    map.patientMap.toCreateInput({
      patient_id: (maxPatient._max.patient_id ?? 0) + 1,
      first_name: data.first_name,
      last_name: data.last_name,
      birthday: data.birthday,
      allergy: data.allergy,
      email: data.email,
      phone: data.phone,
      status: data.status
    })
  )
  return map.patientMap.toResponseList([created])[0]
}

export async function getPatientById(id: number) {
  const patient = await repo.findPatientById(id)
  if (!patient) {
    throw new AppError(404, "PAT-003", "Patient not found", "NOT_FOUND")
  }

  return map.patientMap.toResponse(patient)
}

export async function updatePatient(id: number, data: {
  first_name: string
  last_name: string
  birthday: Date
  allergy: string
  email: string
  phone: string
  status: string
}) {
  if (!validStatuses.has(data.status as status_user)) {
    throw new AppError(400, "PAT-001", "Invalid status. Allowed values: active, inactive", "VALIDATION")
  }

  const existing = await repo.findPatientById(id)
  if (!existing) {
    throw new AppError(404, "PAT-003", "Patient not found", "NOT_FOUND")
  }

  const duplicate = await repo.findPatientDuplicate(data.email, data.phone, id)
  if (duplicate) {
    throw new AppError(409, "PAT-002", "Patient with this email or phone already exists", "CONFLICT")
  }

  const updated = await repo.updatePatient(
    id,
    map.patientMap.toUpdateInput({
      first_name: data.first_name,
      last_name: data.last_name,
      birthday: data.birthday,
      allergy: data.allergy,
      email: data.email,
      phone: data.phone,
      status: data.status
    })
  )

  return map.patientMap.toResponse(updated)
}
