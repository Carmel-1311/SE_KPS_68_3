import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import * as map from "@/app/mappers/staff.mapper"

export async function findStaffs(skip: number, take: number) {
  return prisma.staff.findMany({
    skip,
    take,
    orderBy: { staff_id: "asc" },
    ...map.staffListQuery
  })
}

export async function countStaffs() {
  return prisma.staff.count()
}

export async function findStaffById(id: number) {
  return prisma.staff.findUnique({
    where: { staff_id: id },
    ...map.staffDetailQuery
  })
}

export async function findStaffDuplicate(email: string, phone: string, excludeId?: number) {
  return prisma.staff.findFirst({
    where: {
      ...(excludeId ? { staff_id: { not: excludeId } } : {}),
      OR: [{ email }, { phone }]
    },
    select: { staff_id: true }
  })
}

export async function createStaff(data: Prisma.staffCreateInput) {
  return prisma.staff.create({
    data,
    ...map.staffDetailQuery
  })
}

export async function updateStaff(id: number, data: Prisma.staffUpdateInput) {
  return prisma.staff.update({
    where: { staff_id: id },
    data,
    ...map.staffDetailQuery
  })
}
