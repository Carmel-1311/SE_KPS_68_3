import * as map from "@/app/mappers/work_schedules.mapper"
import * as repo from "@/repositories/work_schedulesRepository"
import { AppError } from "@/utils/AppError"
import { CreateScheduleInput } from "@/app/mappers/work_schedules.mapper"

function parseTimeToDate(time: string) {
    return new Date(`1970-01-01T${time}:00Z`)
}

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

async function ensureNoDuplicateSchedule(
    staffId: number,
    date: CreateScheduleInput["date"],
    startTime: string,
    endTime: string,
    excludeId?: number
) {
    const duplicateSchedule = await repo.findDuplicateWorkSchedule(
        staffId,
        date,
        parseTimeToDate(startTime),
        parseTimeToDate(endTime),
        excludeId
    )

    if (duplicateSchedule) {
        throw new AppError(409, "SCHED-002", "มีตารางเวลานี้อยู่แล้ว หรือช่วงเวลาทับกับตารางเดิม", "CONFLICT")
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

    await ensureNoDuplicateSchedule(
        normalizedData.staff_id,
        normalizedData.date,
        normalizedData.start_time,
        normalizedData.end_time
    )

    const schedule = await repo.createWorkSchedule(map.workScheduleMap.toCreateInput(normalizedData))
    return getWorkScheduleById(schedule.schedule_id, user)
}

export async function updateWorkSchedule(
    id: number,
    data: Parameters<typeof map.workScheduleMap.toUpdateInput>[0],
    user?: { id: number, role: string }
) {
    const existingSchedule = await repo.findWorkScheduleById(id)
    if (!existingSchedule) {
        throw new AppError(404, "SCHED-001", "Work schedule not found", "NOT_FOUND")
    }

    if (user) {
        ensureDentistOwnsSchedule(user, existingSchedule)
    }

    const nextDate = data.date ?? existingSchedule.date
    const nextStartTime = data.start_time ?? existingSchedule.start_time?.toISOString().slice(11, 16)
    const nextEndTime = data.end_time ?? existingSchedule.end_time?.toISOString().slice(11, 16)

    if (!nextDate || !nextStartTime || !nextEndTime) {
        throw new AppError(400, "SCHED-003", "Date and time are required for work schedule", "VALIDATION")
    }

    await ensureNoDuplicateSchedule(
        existingSchedule.staff_id,
        nextDate,
        nextStartTime,
        nextEndTime,
        id
    )

    const updatedSchedule = await repo.updateWorkSchedule(id, map.workScheduleMap.toUpdateInput(data))
    return getWorkScheduleById(updatedSchedule.schedule_id, user)
}

export async function deleteWorkSchedule(id: number, user?: { id: number, role: string }) {
    const existingSchedule = await repo.findWorkScheduleById(id)
    if (user) ensureDentistOwnsSchedule(user, existingSchedule)
    else if (!existingSchedule) throw new AppError(404, "SCHED-001", "Work schedule not found", "NOT_FOUND")

    return repo.deleteWorkSchedule(id)
}
