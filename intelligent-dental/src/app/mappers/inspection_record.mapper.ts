 import { components,paths } from "../../types/api"; // path ไปยังไฟล์ api.ts ของคุณ
import { Prisma, inspection_record, patient } from "@prisma/client";
 
export type InspectionRecordResponse = components["schemas"]["inspection_record"];
export type CreateInspectionRecordInput = paths["/api/inspection_records"]["post"]["requestBody"]["content"]["application/json"];
export type UpdateInspectionRecordInput = paths["/api/inspection_records/{id}"]["put"]["requestBody"]["content"]["application/json"];

export const inspectionRecordQuery = {
    include: {
        patient: true
    }
} as const;

export const inspectionRecordMap = {
    toResponse(data: inspection_record & { patient: patient }): InspectionRecordResponse {
        return {    
            id: data.inspection_record_id,
            patient_id: data.patient_id,
            date: data.date ? data.date.toISOString() : "",
            history: data.history ?? "",
            status: data.status ?? ""
        };
    }
    ,
    toResponseList(list: (inspection_record & { patient: patient })[]): InspectionRecordResponse[] {
        return list.map(item => ({
            id: item.inspection_record_id,
                patient_id: item.patient_id,
                date: item.date ? item.date.toISOString() : "",
                history: item.history ?? "",    
                status: item.status ?? ""
        }));
    }
    ,
    toCreateInput(data: CreateInspectionRecordInput): Prisma.inspection_recordCreateInput {
        return {

            patient: {
                connect: {
                    patient_id: data.patient_id
                }
            },
            date: new Date(data.date),

            history: data.history,
            status: data.status
        };
    },
    toUpdateInput(data: UpdateInspectionRecordInput): Prisma.inspection_recordUpdateInput {
        return {
            ...(data.status && { status: data.status }),
            ...(data.history && { history: data.history }),
        };
    }

}

