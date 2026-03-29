import { components,paths } from "../../types/api"; // path ไปยังไฟล์ api.ts ของคุณ
import { Prisma, work_schedule, staff } from "@prisma/client";

// นิยาม Type จาก OpenAPI 
export type WorkScheduleResponse = components["schemas"]["work_schedules"];
export type CreateScheduleInput = paths["/api/work_schedules"]["post"]["requestBody"]["content"]["application/json"];

// workScheduleMapper.ts
export const workScheduleQuery = {
  include: {
    staff: true
  }
} as const;

export const workScheduleMap = {
  /**
   * 1. Response List & Single (แปลงจาก DB -> API Response)
   * ใช้สำหรับ GET /api/work_schedules และ GET /api/work_schedules/{id}
   */
  toResponse(data: work_schedule & { staff: staff }): WorkScheduleResponse {
    return {
      id: data.schedule_id.toString(), // OpenAPI คาดหวังเป็น string
      staff: {
        id: data.staff_id.toString(),
        name: `${data.staff.prefix} ${data.staff.first_name} ${data.staff.last_name}`,
        role: data.staff.role?.toString() || "staff" // กรณี role เป็น enum หรือ string ใน DB
      },
      date: data.date as "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun",
      start_time: data.start_time ? data.start_time.toISOString().slice(11, 16) : "00:00",
        end_time: data.end_time ? data.end_time.toISOString().slice(11, 16) : "00:00", // "HH:mm",
      is_active: data.is_active ?? true
    };
  },

  toResponseList(list: (work_schedule & { staff: staff })[]): WorkScheduleResponse[] {
    return list.map(item => this.toResponse(item));
  },

  /**
   * 2. Create Mapping (แปลงจาก API Request -> Prisma Input)
   * ใช้สำหรับ POST /api/work_schedules
   */
  toCreateInput(data: CreateScheduleInput & { is_active?: boolean }): Prisma.work_scheduleCreateInput {
    return {
      date: data.date,
      // บังคับปี 1970 เพื่อให้ Prisma @db.Time ทำงานถูกต้อง
      start_time: new Date(`1970-01-01T${data.start_time}:00Z`),
      end_time: new Date(`1970-01-01T${data.end_time}:00Z`),
      is_active: typeof data.is_active === 'boolean' ? data.is_active : true,
      staff: { connect: { staff_id: data.staff_id } }
    };
  },

  /**
   * 3. Update Mapping
   * ใช้สำหรับ PUT /api/work_schedules/{id}
   */
  toUpdateInput(data: any): Prisma.work_scheduleUpdateInput {
    return {
      ...(data.date && { date: data.date }),
      ...(data.start_time && { start_time: new Date(`1970-01-01T${data.start_time}:00Z`) }),
      ...(data.end_time && { end_time: new Date(`1970-01-01T${data.end_time}:00Z`) }),
      ...(typeof data.is_active === 'boolean' && { is_active: data.is_active })
    };
  }
};
