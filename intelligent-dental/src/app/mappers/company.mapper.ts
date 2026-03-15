import { Prisma } from "@prisma/client"

export type CompanyListResponse = {
  id: number
  contect_name: string
  office_name: string
  phone: string
  address: string
  email: string
}

export type CompanyResponse = {
  contect_name: string
  office_name: string
  phone: string
  address: string
  email: string
}

export const companyListQuery =
  Prisma.validator<Prisma.companyDefaultArgs>()({
    select: {
      company_id: true,
      contect_name: true,
      office_name: true,
      phone: true,
      address: true,
      email: true
    }
  })

export type CompanyList = Prisma.companyGetPayload<typeof companyListQuery>

export const companyDetailQuery =
  Prisma.validator<Prisma.companyDefaultArgs>()({
    select: {
      contect_name: true,
      office_name: true,
      phone: true,
      address: true,
      email: true
    }
  })

export type CompanyDetail = Prisma.companyGetPayload<typeof companyDetailQuery>

export const companyMap = {
  toResponseListItem(data: CompanyList): CompanyListResponse {
    return {
      id: data.company_id,
      contect_name: data.contect_name ?? "",
      office_name: data.office_name ?? "",
      phone: data.phone ?? "",
      address: data.address ?? "",
      email: data.email ?? ""
    }
  },

  toResponseList(list: CompanyList[]): CompanyListResponse[] {
    return list.map(item => this.toResponseListItem(item))
  },

  toResponse(data: CompanyDetail): CompanyResponse {
    return {
      contect_name: data.contect_name ?? "",
      office_name: data.office_name ?? "",
      phone: data.phone ?? "",
      address: data.address ?? "",
      email: data.email ?? ""
    }
  }
}
