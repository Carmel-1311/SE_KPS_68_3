import { components, paths } from "../../types/api"
import { Prisma, role_staff } from "@prisma/client"

export type StaffListResponse =
  paths["/api/staff"]["get"]["responses"]["200"]["content"]["application/json"]["data"][number]

export type StaffResponse = components["schemas"]["staff"]

export type CreateStaffInput =
  paths["/api/staff"]["post"]["requestBody"]["content"]["application/json"]

export type UpdateStaffInput =
  paths["/api/staff/{id}"]["put"]["requestBody"]["content"]["application/json"]

export const staffListQuery =
  Prisma.validator<Prisma.staffDefaultArgs>()({
    select: {
      staff_id: true,
      first_name: true,
      last_name: true,
      email: true,
      role: true
    }
  })

export type StaffList = Prisma.staffGetPayload<typeof staffListQuery>

export const staffDetailQuery =
  Prisma.validator<Prisma.staffDefaultArgs>()({
    select: {
      staff_id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      birthday: true,
      license_number: true,
      role: true
    }
  })

export type StaffDetail = Prisma.staffGetPayload<typeof staffDetailQuery>

export const staffMap = {
  toResponseListItem(data: StaffList): StaffListResponse {
    return {
      id: data.staff_id,
      name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
      email: data.email ?? "",
      role: (data.role ?? "staff") as StaffListResponse["role"]
    }
  },

  toResponseList(list: StaffList[]): StaffListResponse[] {
    return list.map(item => this.toResponseListItem(item))
  },

  toResponse(data: StaffDetail): StaffResponse {
    return {
      id: data.staff_id,
      name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
      email: data.email ?? "",
      phone: data.phone ?? "",
      birthday: data.birthday ? data.birthday.toISOString().slice(0, 10) : "",
      license_number: data.license_number ?? null,
      role: (data.role ?? "staff") as StaffResponse["role"]
    }
  },

  toCreateInput(data: CreateStaffInput): Prisma.staffCreateInput {
    return {
      first_name: data.first_name,
      last_name: data.last_name,
      birthday: new Date(data.birthday),
      email: data.email,
      phone: data.phone,
      license_number: data.license_number ?? null,
      role: data.role as role_staff
    }
  },

  toUpdateInput(data: UpdateStaffInput): Prisma.staffUpdateInput {
    return {
      first_name: data.first_name,
      last_name: data.last_name,
      birthday: new Date(data.birthday),
      email: data.email,
      phone: data.phone,
      license_number: data.license_number ?? null
    }
  }
}
