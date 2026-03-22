import { components, paths } from "../../types/api"; // path ไปยังไฟล์ api.ts ของคุณ
import { Prisma, patient_in_mobile, patient } from "@prisma/client";

export type PaMobileResponse = paths["/api/mobile_dentals/{id}/patients"]["get"]["responses"]["200"]["content"]["application/json"]["data"];
export type CreatePaMobileInput =  paths["/api/mobile_dentals/{id}/patients"]["post"]["requestBody"]["content"]["application/json"];
export type UpdatePaMobileInput =  paths["/api/patient_in_mobile/{id}"]["put"]["requestBody"]["content"]["application/json"];

export const PaMoMap = {

  toResponseList(list: (patient_in_mobile & { patient: patient })[]): PaMobileResponse {
    return list.map(item => ({
        id:item.patient_in_mobile_id,
        patient_id: item.patient_id,
        name:item.patient.first_name+" "+item.patient.last_name,
        status:item.patient.status??"",
        phone:item.patient.phone??"",
        idcard:item.patient.id_card??"",
        inspection_id:item.inspection_record_id??0

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
  toUpdateInput(data: UpdatePaMobileInput): Prisma.patient_in_mobileUpdateInput  {
      return {
    patient: {
      update: {
        ...(data.first_name && { first_name: data.first_name }),
        ...(data.last_name && { last_name: data.last_name }),
        ...(data.idcard && { id_card: data.idcard }),
        ...(data.phone && { phone: data.phone }),
        ...(data.birthday && { birthday: new Date(data.birthday) }),
      }
    },
    inspection_record:{
      update:{...(data.inspection_id && {inspection_record_id:data.inspection_id})}
    }
      }
    }

};
