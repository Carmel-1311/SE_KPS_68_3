import { Prisma, status_user } from "@prisma/client"

export type PatientListResponse = {
  id: number
  first_name: string
  last_name: string
  name: string
  email: string
  phone: string
  birthday: string | null
  allergy: string
  status: string
}

export type PatientResponse = {
  id: number
  name: string
  email: string
  phone: string
  birthday: string | null
  allergy?: string | null
}

export const patientListQuery =
  Prisma.validator<Prisma.patientDefaultArgs>()({
    select: {
      patient_id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      birthday: true,
      allergy: true,
      status: true
    }
  })

export type PatientList = Prisma.patientGetPayload<typeof patientListQuery>

export const patientDetailQuery =
  Prisma.validator<Prisma.patientDefaultArgs>()({
    select: {
      patient_id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      birthday: true,
      allergy: true
    }
  })

export type PatientDetail = Prisma.patientGetPayload<typeof patientDetailQuery>

export const patientMap = {
  toResponseList(list: PatientList[]): PatientListResponse[] {
    return list.map(item => ({
      id: item.patient_id,
      first_name: item.first_name ?? "",
      last_name: item.last_name ?? "",
      name: `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim(),
      email: item.email ?? "",
      phone: item.phone ?? "",
      birthday: item.birthday ? item.birthday.toISOString().slice(0, 10) : null,
      allergy: item.allergy ?? "",
      status: item.status ?? "active"
    }))
  },

  toResponse(data: PatientDetail): PatientResponse {
    return {
      id: data.patient_id,
      name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
      email: data.email ?? "",
      phone: data.phone ?? "",
      birthday: data.birthday ? data.birthday.toISOString().slice(0, 10) : null,
      allergy: data.allergy ?? ""
    }
  },

  toCreateInput(data: {
    first_name: string
    last_name: string
    birthday: Date
    allergy: string
    email: string
    phone: string
    status: string
  }): Prisma.patientCreateInput {
    return {
      first_name: data.first_name,
      last_name: data.last_name,
      birthday: data.birthday,
      allergy: data.allergy,
      email: data.email,
      phone: data.phone,
      status: data.status as status_user
    }
  },

  toUpdateInput(data: {
    first_name: string
    last_name: string
    birthday: Date
    allergy: string
    email: string
    phone: string
    status: string
  }): Prisma.patientUpdateInput {
    return {
      first_name: data.first_name,
      last_name: data.last_name,
      birthday: data.birthday,
      allergy: data.allergy,
      email: data.email,
      phone: data.phone,
      status: data.status as status_user
    }
  }
}
