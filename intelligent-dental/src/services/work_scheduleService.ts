import * as map from "@/app/mappers/work_schedules.mapper"
import * as repo from "@/repositories/work_schedulesRepository"
import { AppError } from "@/utils/AppError"
import { CreateScheduleInput } from "@/app/mappers/work_schedules.mapper"

function ensureDentistOwnsSchedule(
    user: { id: number, role: string },
    schedule: { staff_id: number } | null
) {
    if (!schedule) {
        throw new AppError(404, "SCHED-001", "Work schedule not found", "NOT_FOUND")
    }

    if (user.role === "dentist" && schedule.staff_id !== user.id) {
        throw new AppError(403, "AUTH-003", "Access denied for this work schedule", "AUTH")
    }
}

export async function getAllWorkSchedulesByUser(
    user: { id: number, role: string },
    page: number,
    limit: number
): Promise<{
    data: ReturnType<typeof map.workScheduleMap.toResponseList>
    total: number
}> {

    const skip = (page - 1) * limit

    const result =
        user.role === "dentist"
            ? await repo.findWorkSchedulesByStaffId(user.id, skip, limit)
            : await repo.findAllWorkSchedules(skip, limit)

    return {
        data: map.workScheduleMap.toResponseList(result.data),
        total: result.total
    }
}

export async function getWorkScheduleById(id: number, user?: { id: number, role: string })
    : Promise<ReturnType<typeof map.workScheduleMap.toResponse>> {

    const schedule = await repo.findWorkScheduleById(id)

    if (!schedule) {
        throw new AppError(404, "SCHED-001", "Work schedule not found", "NOT_FOUND")
    }

    if (user) {
        ensureDentistOwnsSchedule(user, schedule)
    }

    return map.workScheduleMap.toResponse(schedule)
}

export async function createWorkSchedule(
    data: CreateScheduleInput,
    user?: { id: number, role: string }
) {
    const normalizedData = user?.role === "dentist"
        ? { ...data, staff_id: user.id }
        : data

    const schedule = await repo.createWorkSchedule(map.workScheduleMap.toCreateInput(normalizedData))
    return getWorkScheduleById(schedule.schedule_id, user)
}

export async function updateWorkSchedule(
    id: number,
    data: Parameters<typeof map.workScheduleMap.toUpdateInput>[0],
    user?: { id: number, role: string }
) {
    const existingSchedule = await repo.findWorkScheduleById(id)
    if (user) ensureDentistOwnsSchedule(user, existingSchedule)
    else if (!existingSchedule) throw new AppError(404, "SCHED-001", "Work schedule not found", "NOT_FOUND")

    const updatedSchedule = await repo.updateWorkSchedule(id, map.workScheduleMap.toUpdateInput(data))
    return getWorkScheduleById(updatedSchedule.schedule_id, user)
}

export async function deleteWorkSchedule(id: number, user?: { id: number, role: string }) {
    const existingSchedule = await repo.findWorkScheduleById(id)
    if (user) ensureDentistOwnsSchedule(user, existingSchedule)
    else if (!existingSchedule) throw new AppError(404, "SCHED-001", "Work schedule not found", "NOT_FOUND")

    return repo.deleteWorkSchedule(id)
}
