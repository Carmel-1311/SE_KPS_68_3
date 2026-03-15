import { Prisma } from "@prisma/client"
import * as map from "@/app/mappers/work_schedules.mapper"
import { prisma } from "@/utils/prisma"

export async function findAllWorkSchedules(
  skip: number,
  limit: number
) {

  const [data, total] = await Promise.all([
    prisma.work_schedule.findMany({
      skip,
      take: limit,
      ...map.workScheduleQuery
    }),
    prisma.work_schedule.count()
  ])

  return { data, total }
}

export async function findWorkSchedulesByStaffId(
  staff_id: number,
  skip: number,
  limit: number
) {

  const [data, total] = await Promise.all([
    prisma.work_schedule.findMany({
      where: { staff_id },
      skip,
      take: limit,
      ...map.workScheduleQuery
    }),
    prisma.work_schedule.count({
      where: { staff_id }
    })
  ])

  return { data, total }
}

export async function createWorkSchedule(data: Prisma.work_scheduleCreateInput) {
    return prisma.work_schedule.create({ data, ...map.workScheduleQuery })
}

export async function updateWorkSchedule(id: number, data: Prisma.work_scheduleUpdateInput) {
    return prisma.work_schedule.update({
        where: { schedule_id: id },
        data,
        ...map.workScheduleQuery
    })
}

export async function deleteWorkSchedule(id: number) {
    return prisma.work_schedule.delete({
        where: { schedule_id: id }
    })
}

export async function findWorkScheduleById(id: number) {
    return prisma.work_schedule.findUnique({
        where: { schedule_id: id },
        ...map.workScheduleQuery
    })  
}
