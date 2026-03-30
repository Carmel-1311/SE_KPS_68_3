import * as repo from "@/repositories/patientRepository"
import { AppError } from "@/utils/AppError"
import * as map from "@/app/mappers/patient.mapper"
import { staffDetailQuery, staffMap } from "@/app/mappers/staff.mapper"
import type { CreatePatientInput } from "@/app/mappers/patient.mapper"
import type { UpdatePatientInput } from "@/app/mappers/patient.mapper"
import { prisma } from "@/utils/prisma"
import { role_staff, status_user } from "@prisma/client"

const validStatuses = new Set(Object.values(status_user))
const validStaffRoles = new Set(Object.values(role_staff))

function getDuplicatePatientMessage(
  duplicate: { email: string | null; phone: string | null },
  data: { email: string; phone: string }
) {
  if (duplicate.email === data.email) {
    return "Patient with this email already exists"
  }

  if (duplicate.phone === data.phone) {
    return "Patient with this phone already exists"
  }

  return "Patient with this email or phone already exists"
}

export async function listPatients(limit: number, page: number) {
  const [patients, total] = await Promise.all([
    repo.findPatients((page - 1) * limit, limit),
    repo.countPatients()
  ])

  return {
    data: map.patientMap.toResponseList(patients),
    total
  }
}

export async function createPatient(data: CreatePatientInput) {
  if (!validStatuses.has(data.status as status_user)) {
    throw new AppError(400, "PAT-001", "Invalid status. Allowed values: active, inactive", "VALIDATION")
  }

  const duplicate = await repo.findPatientDuplicate(data.email, data.phone)
  if (duplicate) {
    throw new AppError(409, "PAT-002", getDuplicatePatientMessage(duplicate, data), "CONFLICT")
  }

  const created = await repo.createPatient(map.patientMap.toCreateInput(data))
  return map.patientMap.toResponseList([created])[0]
}

export async function getPatientById(id: number) {
  const patient = await repo.findPatientById(id)
  if (!patient) {
    throw new AppError(404, "PAT-003", "Patient not found", "NOT_FOUND")
  }

  return map.patientMap.toResponse(patient)
}

export async function updatePatient(id: number, data: UpdatePatientInput) {
  if (data.status && !validStatuses.has(data.status as status_user)) {
    throw new AppError(400, "PAT-001", "Invalid status. Allowed values: active, inactive", "VALIDATION")
  }

  const existing = await repo.findPatientById(id)
  if (!existing) {
    throw new AppError(404, "PAT-003", "Patient not found", "NOT_FOUND")
  }

  const nextEmail = data.email ?? existing.email ?? ""
  const nextPhone = data.phone ?? existing.phone ?? ""

  if (data.email || data.phone) {
    const duplicate = await repo.findPatientDuplicate(nextEmail, nextPhone, id)
    if (duplicate) {
      throw new AppError(
        409,
        "PAT-002",
        getDuplicatePatientMessage(duplicate, { email: nextEmail, phone: nextPhone }),
        "CONFLICT"
      )
    }
  }

  const updated = await repo.updatePatient(
    id,
    map.patientMap.toUpdateInput(data)
  )

  return map.patientMap.toResponse(updated)
}

type TransferPatientToStaffInput = {
  role?: string
  license_number?: string | null
  prefix?: string | null
}

export async function transferPatientToStaff(
  patientId: number,
  data: TransferPatientToStaffInput
) {
  const requestedRole = data.role?.trim().toLowerCase() || "staff"
  if (!validStaffRoles.has(requestedRole as role_staff)) {
    throw new AppError(400, "STAFF-001", "Invalid role. Allowed values: staff, dentist", "VALIDATION")
  }

  const patient = await prisma.patient.findUnique({
    where: { patient_id: patientId },
    select: {
      patient_id: true,
      first_name: true,
      last_name: true,
      birthday: true,
      email: true,
      phone: true,
      account_id: true
    }
  })

  if (!patient) {
    throw new AppError(404, "PAT-003", "Patient not found", "NOT_FOUND")
  }

  if (!patient.account_id) {
    throw new AppError(409, "STAFF-004", "Patient is not linked to an account", "BUSINESS")
  }

  const existingStaffByAccount = await prisma.staff.findFirst({
    where: { account_id: patient.account_id },
    select: { staff_id: true }
  })
  if (existingStaffByAccount) {
    throw new AppError(409, "STAFF-002", "This account is already linked to a staff profile", "CONFLICT")
  }

  const duplicateStaff = await prisma.staff.findFirst({
    where: {
      OR: [{ email: patient.email }, { phone: patient.phone }]
    },
    select: { staff_id: true }
  })
  if (duplicateStaff) {
    throw new AppError(409, "STAFF-002", "Staff with this email or phone already exists", "CONFLICT")
  }

  const accountRole = requestedRole === "dentist" ? "doctor" : "staff"

  const createdStaff = await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { account_id: patient.account_id! },
      data: { account_role: accountRole }
    })

    const staff = await tx.staff.create({
      data: {
        first_name: patient.first_name,
        last_name: patient.last_name,
        birthday: patient.birthday,
        email: patient.email,
        phone: patient.phone,
        license_number: data.license_number?.trim() || null,
        prefix: data.prefix?.trim() || null,
        role: requestedRole as role_staff,
        account_id: patient.account_id
      },
      ...staffDetailQuery
    })

    await tx.patient.update({
      where: { patient_id: patientId },
      data: { account_id: null }
    })

    return staff
  })

  return staffMap.toResponse(createdStaff)
}
