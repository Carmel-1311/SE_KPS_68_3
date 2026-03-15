import { prisma } from "@/utils/prisma"
import * as map from "@/app/mappers/company.mapper"

export async function findCompanies() {
  return prisma.company.findMany({
    ...map.companyListQuery
  })
}

export async function findCompanyById(id: number) {
  return prisma.company.findUnique({
    where: { company_id: id },
    ...map.companyDetailQuery
  })
}
