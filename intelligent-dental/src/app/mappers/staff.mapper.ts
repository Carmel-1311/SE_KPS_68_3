import { Prisma } from "@prisma/client"

export type StaffListResponse = {
  id: number
  name: string
  email: string
  role: string
}

export type StaffResponse = {
  id: number
  name: string
  email: string
}

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
      email: true
    }
  })

export type StaffDetail = Prisma.staffGetPayload<typeof staffDetailQuery>

export const staffMap = {
  toResponseListItem(data: StaffList): StaffListResponse {
    return {
      id: data.staff_id,
      name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
      email: data.email ?? "",
      role: data.role ?? ""
    }
  },

  toResponseList(list: StaffList[]): StaffListResponse[] {
    return list.map(item => this.toResponseListItem(item))
  },

  toResponse(data: StaffDetail): StaffResponse {
    return {
      id: data.staff_id,
      name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
      email: data.email ?? ""
    }
  },

  toCreateInput(data: {
    first_name: string
    last_name: string
    birthday: Date
    email: string
    phone: string
    license_number: string | null
    role: string
  }): Prisma.staffCreateInput {
    return {
      first_name: data.first_name,
      last_name: data.last_name,
      birthday: data.birthday,
      email: data.email,
      phone: data.phone,
      license_number: data.license_number,
      role: data.role as "staff" | "dentist"
    }
  },

  toUpdateInput(data: {
    first_name: string
    last_name: string
    birthday: Date
    email: string
    phone: string
    license_number: string | null
  }): Prisma.staffUpdateInput {
    return {
      first_name: data.first_name,
      last_name: data.last_name,
      birthday: data.birthday,
      email: data.email,
      phone: data.phone,
      license_number: data.license_number
    }
  }
}
