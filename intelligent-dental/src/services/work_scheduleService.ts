import * as map from "@/app/mappers/work_schedules.mapper"
import * as repo from "@/repositories/work_schedulesRepository"
import { AppError } from "@/utils/AppError"
import { CreateScheduleInput } from "@/app/mappers/work_schedules.mapper"

export async function getAllWorkSchedulesByUser(user: { id: number, role: string }): Promise<ReturnType<typeof map.workScheduleMap.toResponseList>> {
    if (user.role === "dentist") {
        return map.workScheduleMap.toResponseList(await repo.findWorkSchedulesByStaffId(user.id))
    }
    else {
        return map.workScheduleMap.toResponseList(await repo.findAllWorkSchedules())
    }
}

export async function getWorkScheduleById(id: number) 
: Promise<ReturnType<typeof map.workScheduleMap.toResponse>> {

    const schedule = await repo.findWorkScheduleById(id)

    if (!schedule) {
        throw new AppError(404, "SCHED-001", "Work schedule not found", "NOT_FOUND")
    }
    
    return map.workScheduleMap.toResponse(schedule)
}

export async function createWorkSchedule(data: CreateScheduleInput) {
    const schedule = await repo.createWorkSchedule(map.workScheduleMap.toCreateInput(data))
    return getWorkScheduleById(schedule.schedule_id)
}

export async function updateWorkSchedule(id: number, data: any) {
    // Check if schedule exists before updating to provide meaningful error message
    const existingSchedule = await repo.findWorkScheduleById(id)
    if (!existingSchedule) {
        throw new AppError(404, "SCHED-001", "Work schedule not found", "NOT_FOUND")
    }
    const updatedSchedule = await repo.updateWorkSchedule(id, map.workScheduleMap.toUpdateInput(data))
    return getWorkScheduleById(updatedSchedule.schedule_id)
}

export async function deleteWorkSchedule(id: number) {
    // Check if schedule exists before deleting to provide meaningful error message
    const existingSchedule = await repo.findWorkScheduleById(id)
    if (!existingSchedule) {
        throw new AppError(404, "SCHED-001", "Work schedule not found", "NOT_FOUND")
    }
    return repo.deleteWorkSchedule(id)
}