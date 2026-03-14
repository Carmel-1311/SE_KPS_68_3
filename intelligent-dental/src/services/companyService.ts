import * as repo from "@/repositories/companyRepository"
import { AppError } from "@/utils/AppError"
import * as map from "@/app/mappers/company.mapper"

export async function listCompanies() {
  const companies = await repo.findCompanies()
  return map.companyMap.toResponseList(companies)
}

export async function getCompanyById(id: number) {
  const company = await repo.findCompanyById(id)
  if (!company) {
    throw new AppError(404, "COMP-001", "Company not found", "NOT_FOUND")
  }

  return map.companyMap.toResponse(company)
}
