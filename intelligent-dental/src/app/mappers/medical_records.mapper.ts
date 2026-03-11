import { inspect } from "util";
import { components, paths } from "../../types/api"; // path ไปยังไฟล์ api.ts ของคุณ
import { Prisma, medical_records, staff, patient, inspection_record, dental_examination_detail, type } from "@prisma/client";


export type MedicalRecordResponse = paths["/api/medical_records/{id}"]["get"]["responses"]["200"]["content"]["application/json"]["data"];
export type CreateMedicalRecordInput = paths["/api/medical_records"]["post"]["requestBody"]["content"]["application/json"];
export type UpdateMedicalRecordInput = paths["/api/medical_records/{id}"]["put"]["requestBody"]["content"]["application/json"];
export type MedicalRecordList = components["schemas"]["medical_record"];

export const medicalRecordQuery = {
    include: {
        patient: true,
        staff: true,
        inspection_record: true,
        dental_examination_detail: true,
        type: true
    }
} as const;
// medicalRecordMapper.ts
export const medicalRecordMap = {
    /**
     * 1. Response List & Single (แปลงจาก DB -> API Response)
     * ใช้สำหรับ GET /api/medical_records และ GET /api/medical_records/{id}
     * ในที่นี้เราจะสมมติว่า medical_records มีความสัมพันธ์กับ patient, staff, inspection_record และ dental_examination_detail
     * และเราจะรวมข้อมูลเหล่านั้นใน response ด้วย
     */
    toResponse(data: medical_records & {
        patient: patient;
        inspection_record: inspection_record | null;
        dental_examination_detail: (dental_examination_detail & {
            type: type
        })[];
    }): MedicalRecordResponse {
        return {
            id: data.examination_id,
            patients_id: data.patient_id,
            date: data.examination_date ? data.examination_date.toISOString() : "",
            history: data.examination_history ?? "",
            status: data.examination_status ?? "",
            detail: data.dental_examination_detail?.map(d => ({
                id: d.dental_examination_detail_id ,
                examination_type: {
                    id: d.type?.type_id ?? 0,
                    name: d.type?.name ?? ""
                } ,// สมมติว่า examination_type เป็น enum ใน DB
            diagnosis: d.diagnosis_ ?? ""
            })) ?? [],
            inspection_record: data.inspection_record?
            {
                id: data.inspection_record.inspection_record_id,
                date: data.inspection_record.date?.toISOString() ?? "",
                history: data.inspection_record.history ?? "",
                status: data.inspection_record.status ?? ""
            }: undefined
        };
    },

    toResponseList(list: (medical_records & {
        patient: patient;
        inspection_record: inspection_record | null;
        dental_examination_detail: (dental_examination_detail & {
            type: type
        })[];
    })[]): MedicalRecordResponse[] {
        return list.map(item => this.toResponse(item));
        },


    }
