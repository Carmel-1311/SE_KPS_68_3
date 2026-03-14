import * as repo from "@/repositories/staffRepository"
import { AppError } from "@/utils/AppError"
import * as map from "@/app/mappers/staff.mapper"
import { role_staff } from "@prisma/client"

const validRoles = new Set(Object.values(role_staff))

export async function listStaffs(limit: number, page: number) {
  const staffs = await repo.findStaffs((page - 1) * limit, limit)
  return map.staffMap.toResponseList(staffs)
}

export async function createStaff(data: {
  first_name: string
  last_name: string
  birthday: Date
  email: string
  phone: string
  license_number: string | null
  role: string
}) {
  if (!validRoles.has(data.role as role_staff)) {
    throw new AppError(400, "STAFF-001", "Invalid role. Allowed values: staff, dentist", "VALIDATION")
  }

  const duplicate = await repo.findStaffDuplicate(data.email, data.phone)
  if (duplicate) {
    throw new AppError(409, "STAFF-002", "Staff with this email or phone already exists", "CONFLICT")
  }

  const created = await repo.createStaff(
    map.staffMap.toCreateInput({
      first_name: data.first_name,
      last_name: data.last_name,
      birthday: data.birthday,
      email: data.email,
      phone: data.phone,
      license_number: data.license_number,
      role: data.role
    })
  )

  return map.staffMap.toResponse(created)
}

export async function getStaffById(id: number) {
  const staff = await repo.findStaffById(id)
  if (!staff) {
    throw new AppError(404, "STAFF-003", "Staff not found", "NOT_FOUND")
  }

  return map.staffMap.toResponse(staff)
}

export async function updateStaffById(id: number, data: {
  first_name: string
  last_name: string
  birthday: Date
  email: string
  phone: string
  license_number: string | null
}) {
  const existing = await repo.findStaffById(id)
  if (!existing) {
    throw new AppError(404, "STAFF-003", "Staff not found", "NOT_FOUND")
  }

  const duplicate = await repo.findStaffDuplicate(data.email, data.phone, id)
  if (duplicate) {
    throw new AppError(409, "STAFF-002", "Staff with this email or phone already exists", "CONFLICT")
  }

  const updated = await repo.updateStaff(
    id,
    map.staffMap.toUpdateInput({
      first_name: data.first_name,
      last_name: data.last_name,
      birthday: data.birthday,
      email: data.email,
      phone: data.phone,
      license_number: data.license_number
    })
  )

  return map.staffMap.toResponse(updated)
}
