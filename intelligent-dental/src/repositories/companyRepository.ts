import { prisma } from "@/utils/prisma"
import * as map from "@/app/mappers/company.mapper"

export async function findCompanies(skip: number, take: number) {
  return prisma.company.findMany({
    skip,
    take,
    orderBy: { company_id: "asc" },
    ...map.companyListQuery
  })
}

export async function countCompanies() {
  return prisma.company.count()
}

export async function findCompanyById(id: number) {
  return prisma.company.findUnique({
    where: { company_id: id },
    ...map.companyDetailQuery
  })
}
