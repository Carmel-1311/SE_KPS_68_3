import { Prisma } from "@prisma/client"

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
  toResponseListItem(data: PatientList): PatientListResponse {
    return {
      id: data.patient_id,
      first_name: data.first_name ?? "",
      last_name: data.last_name ?? "",
      name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
      email: data.email ?? "",
      phone: data.phone ?? "",
      birthday: data.birthday ? data.birthday.toISOString().slice(0, 10) : null,
      allergy: data.allergy ?? "",
      status: data.status ?? "active"
    }
  },

  toResponseList(list: PatientList[]): PatientListResponse[] {
    return list.map(item => this.toResponseListItem(item))
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
    patient_id: number
  }): Prisma.patientCreateInput {
    return {
      patient_id: data.patient_id,
      first_name: data.first_name,
      last_name: data.last_name,
      birthday: data.birthday,
      allergy: data.allergy,
      email: data.email,
      phone: data.phone,
      status: data.status as "active" | "inactive"
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
      status: data.status as "active" | "inactive"
    }
  }
}
