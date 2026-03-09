import { z } from "zod";
import { da } from "zod/v4/locales";


export const AppointmentSchema = z.object({
    patient: z.object({
        id: z.number().optional(),
        name: z.string().min(2, "ชื่อผู้ป่วยต้องมีอย่างน้อย 2 ตัวอักษร")
    }),

    staff: z.object({
        id: z.number(),
        name: z.string().min(2, "ชื่อพนักงานต้องมีอย่างน้อย 2 ตัวอักษร")
    }).optional(),

    appointment_date: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "วันที่ไม่ถูกต้อง"
        }),

    appointment_time: z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "เวลาต้องอยู่ในรูปแบบ HH:mm"),

    type: z.string().min(2),

    status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
    medical_records: z.object({
        id: z.number(),
        date: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "วันที่ไม่ถูกต้อง"
        }),
        history: z.string(),
        status: z.string(),
        detail: z.array(z.object({
            id: z.number(),
            diagnosis: z.string(),
        }))
    }).optional(),
    inspection_record: z.object({
        id: z.number(),
        date: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "วันที่ไม่ถูกต้อง"
        }),
        history: z.string(),
        status: z.string(),
    }).optional()
})

export type AppointmentResponseDTO = z.infer<typeof AppointmentSchema>;

export const CreateAppointmentSchema = AppointmentSchema.omit({
    patient: true,
    staff: true,
    medical_records: true,
    inspection_record: true
}).extend({
    patient_id: z.number(),
    staff_id: z.number()
});

export type CreateAppointmentDTO = z.infer<typeof CreateAppointmentSchema>;

export const UpdateAppointmentSchema = CreateAppointmentSchema.partial();

export type UpdateAppointmentDTO = z.infer<typeof UpdateAppointmentSchema>;
