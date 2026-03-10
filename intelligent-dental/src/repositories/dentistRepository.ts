import { date_week, Prisma } from "@prisma/client"
import * as map from "@/app/mappers/appointment.mapper"
import {prisma} from "@/utils/prisma"

// ใน dentistRepository.ts
export async function findFreeDentist(
  appointmentTimeStr: string, // รับเป็น "11:00:00" ตรงๆ เลย
  appointmentDate: Date,
  day: date_week
) {
  // ใส่ log ดูค่าที่ส่งเข้า Prisma จริงๆ
  console.log("Querying with:", { appointmentTimeStr, day });

  return await prisma.staff.findFirst({
    where: {
      role: "dentist",
      work_schedule: {
        some: {
          date: day,
          is_active: true,
          // ใช้ String ในการเทียบเวลา (ถ้า DB เป็น Time จะเข้าใจ String format 'HH:mm:ss')
          start_time: { lte: new Date(`1970-01-01T${appointmentTimeStr}Z`) },
          end_time: { gte: new Date(`1970-01-01T${appointmentTimeStr}Z`) }
        }
      },
      appointment: {
        none: {
          staff_id: { not: null },
          appointment_date: appointmentDate,
          // ตรงนี้สำคัญมาก: ต้องตรงกับที่บันทึกไว้เป๊ะๆ
          appointment_time: new Date(`1970-01-01T${appointmentTimeStr}Z`)
        }
      }
    },
    select: { staff_id: true, first_name: true, last_name: true }
  });
}

// dentistRepository.ts
export async function getDentistAppointmentsByDate(date: Date, day: date_week) {
  return await prisma.staff.findMany({
    where: {
      role: "dentist",
      work_schedule: { some: { date: day, is_active: true } }
    },
    select: {
      staff_id: true,
      first_name: true,
      last_name: true,
      work_schedule: {
        where: { date: day },
        select: { start_time: true, end_time: true }
      },
      appointment: {
        where: { appointment_date: date },
        select: { appointment_time: true }
      }
    }
  });
}