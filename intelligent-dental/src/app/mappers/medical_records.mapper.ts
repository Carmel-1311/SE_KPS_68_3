import { inspect } from "util";
import { components, paths } from "../../types/api"; // path ไปยังไฟล์ api.ts ของคุณ
import { Prisma, medical_records, staff, patient, inspection_record, dental_examination_detail, type } from "@prisma/client";


export type MedicalRecordResponse = paths["/api/medical_records/{id}"]["get"]["responses"]["200"]["content"]["application/json"]["data"];
export type CreateMedicalRecordInput = paths["/api/medical_records"]["post"]["requestBody"]["content"]["application/json"];
export type UpdateMedicalRecordInput = paths["/api/medical_records/{id}"]["put"]["requestBody"]["content"]["application/json"];
export type MedicalRecordList = paths["/api/patients/{patient_id}/medical_records"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export const medicalRecordQuery = {
  include: {
    patient: true,
    inspection_record: true,
    dental_examination_detail: {
      include: {
        type: true
      }
    }
  }
} as const


export type MedicalRecordWithRelation =
  Prisma.medical_recordsGetPayload<typeof medicalRecordQuery>
// medicalRecordMapper.ts
export const medicalRecordMap = {
    /**
     * 1. Response List & Single (แปลงจาก DB -> API Response)
     * ใช้สำหรับ GET /api/medical_records และ GET /api/medical_records/{id}
     * ในที่นี้เราจะสมมติว่า medical_records มีความสัมพันธ์กับ patient, staff, inspection_record และ dental_examination_detail
     * และเราจะรวมข้อมูลเหล่านั้นใน response ด้วย
     */
    toResponse(data:MedicalRecordWithRelation): MedicalRecordResponse {
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
            inspection_record: 
            {
                id: data.inspection_record?.inspection_record_id ?? 0,
                date: data.inspection_record?.date?.toISOString() ?? "",
                history: data.inspection_record?.history ?? "",
                status: data.inspection_record?.status ?? ""
            }
        };
    },

    toResponseList(list: MedicalRecordWithRelation[]): MedicalRecordList {
        return list.map(item => ({
            id: item.examination_id,
            patient_id: item.patient_id,
            date: item.examination_date ? item.examination_date.toISOString() : "",
            history: item.examination_history ?? "",
            status: item.examination_status ?? "",
            inspection_record_id: item.inspection_record ? item.inspection_record.inspection_record_id : 0
        })
    );
        },

    /**
     * 2. Input (แปลงจาก API Request -> DB)
     * ใช้สำหรับ POST /api/medical_records และ PUT /api/medical_records/{id}   
    }
        */
    toCreateInput(data: CreateMedicalRecordInput): Prisma.medical_recordsCreateInput {
        return {
            patient: {
                connect: {
                    patient_id: data.patient_id
                }
            },
            examination_date: new Date(data.date),
            examination_history: data.history,  
            examination_status: data.status,
            dental_examination_detail: {
                create: data.detail.map(d => ({
                    type: {
                        connect: {
                            type_id: d.type_id
                        }
                    },
                    diagnosis_: d.diagnosis
                }))
            },
            inspection_record: {
                create: {
                    inspection_record_id: data.inspection_record_id,
                    patient_id: data.patient_id,
                }
            },  

        };
    },
        toUpdateInput(data: UpdateMedicalRecordInput): Prisma.medical_recordsUpdateInput{
            return {
                ...(data.status && { examination_status: data.status }),
                ...(data.history && { examination_history: data.history }),
                ...(data.detail && {
                    dental_examination_detail: {
                        deleteMany: {}, // ลบข้อมูลเดิมทั้งหมด
                        create: data.detail.map(d => ({
                            type: {
                                connect: {
                                    type_id: d.type_id
                                }
                            },
                            diagnosis_: d.diagnosis
                        }))
                    }
                }),
            };

    },

}
