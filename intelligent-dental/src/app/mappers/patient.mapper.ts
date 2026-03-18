import { components, paths } from "../../types/api"
import { Prisma, status_user } from "@prisma/client"

export type PatientListResponse =
  paths["/api/patients"]["get"]["responses"]["200"]["content"]["application/json"]["data"][number]

export type PatientResponse = components["schemas"]["patient"]

export type CreatePatientInput =
  paths["/api/patients"]["post"]["requestBody"]["content"]["application/json"]

export type UpdatePatientInput =
  paths["/api/patients/{id}"]["put"]["requestBody"]["content"]["application/json"]

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
      name: `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim(),
      email: item.email ?? ""
    }))
  },

  toResponse(data: PatientDetail): PatientResponse {
    return {
      id: data.patient_id,
      name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
      email: data.email ?? "",
      phone: data.phone ?? "",
      birthday: data.birthday ? data.birthday.toISOString().slice(0, 10) : "",
      allergy: data.allergy ?? null
    }
  },

  toCreateInput(data: CreatePatientInput): Prisma.patientCreateInput {
    return {
      first_name: data.first_name,
      last_name: data.last_name,
      birthday: new Date(data.birthday),
      allergy: data.allergy ?? undefined,
      email: data.email,
      phone: data.phone,
      ...(data.status ? { status: data.status as status_user } : {})
    }
  },

  toUpdateInput(data: UpdatePatientInput): Prisma.patientUpdateInput {
    return {
      first_name: data.first_name,
      last_name: data.last_name,
      birthday: new Date(data.birthday),
      allergy: data.allergy ?? undefined,
      email: data.email,
      phone: data.phone,
      ...(data.status ? { status: data.status as status_user } : {})
    }
  }
}
