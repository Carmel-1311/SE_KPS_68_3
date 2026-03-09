import { date_week, Prisma } from "@prisma/client"
import * as map from "@/app/mappers/appointment.mapper"
import {prisma} from "@/utils/prisma"

export async function findFreeDentist(
  appointmentTime: string,
    appointmentDate: Date,
    day :date_week
) {
    const dentist = await prisma.staff.findFirst({
  where: {
    role: "dentist",

    work_schedule: {
      some: {
        date: day,
        is_active: true,

        start_time: { lte: appointmentTime },
        end_time: { gte: appointmentTime }
      }
    },

    appointment: {
      none: {
        appointment_date: appointmentDate,
        appointment_time: appointmentTime
      }
    }
  },

  select: {
    staff_id: true,
    first_name: true,
    last_name: true
  }
})
    return dentist??null;
}