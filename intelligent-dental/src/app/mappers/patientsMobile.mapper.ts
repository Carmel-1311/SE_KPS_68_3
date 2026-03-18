import { components, paths } from "../../types/api"; // path ไปยังไฟล์ api.ts ของคุณ
import { Prisma, patient_in_mobile, patient } from "@prisma/client";

export type PaMobileResponse = paths["/api/mobile_dental/{id}/patients"]["get"]["responses"]["200"]["content"]["application/json"]["data"];
export type CreatePaMobileInput =  paths["/api/mobile_dental/{id}/patients"]["post"]["requestBody"]["content"]["application/json"];

export const PaMoMap = {

  toResponseList(list: (patient_in_mobile & { patient: patient })[]): PaMobileResponse {
    return list.map(item => ({
        id:item.patient_in_mobile_id,
        patient_id: item.patient_id,
        name:item.patient.first_name+" "+item.patient.last_name,
        status:item.patient.status??"",
        phone:item.patient.phone??"",
        idcard:item.patient.id_card??""
    }));
  },

  /**
   * 2. Create Mapping (แปลงจาก API Request -> Prisma Input)
   * ใช้สำหรับ POST /api/patient_in_mobiles
   */
  toCreateInput(list: CreatePaMobileInput): Prisma.patient_in_mobileCreateInput[] {
    return list.map(item => ({
        mobile_dental_id:item.mobile_id,
        patient: {
            create: {
            first_name:item.first_name,
            last_name:item.last_name,
            id_card: item.idcard,
            phone:item.phone??"",
            birthday:item.birthday ? new Date(item.birthday) : null
            }
        }
    }));
  },


};
