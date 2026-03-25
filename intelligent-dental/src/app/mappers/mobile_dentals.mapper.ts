import { components, paths } from "../../types/api"; // path ไปยังไฟล์ api.ts ของคุณ
import { Prisma, mobile_dental, company } from "@prisma/client";


export const mobileDentalQuery = {
  include: {
    company: true
  }
} as const

export type MobileDentalsResponse = components["schemas"]["mobile_dental"];
export type CreateMobileDentalsInput =  paths["/api/mobile_dentals"]["post"]["requestBody"]["content"]["application/json"];
export type UpdateMobileDentalnput = paths["/api/mobile_dentals/{id}"]["put"]["requestBody"]["content"]["application/json"];
export const MobileDentalsMap = {
    toRespons(data : mobile_dental & { company: company  | null}): MobileDentalsResponse {
        return {
            mobile_dental_id:data.mobile_dental_id,
            company:{
                id:data.company?.company_id ?? 0,
                office_name:data.company?.office_name ?? ""
            },
            date: data.date?.toISOString() ?? "",
            count: data.count ?? 0,
            status:data.status ?? "request",
            address:data.address ?? ""
        };
    },
    toResponseList(list:( mobile_dental & { company: company  | null })[]): MobileDentalsResponse[]{
        return list.map(item => this.toRespons(item));
    },
    toCreateInput(data:CreateMobileDentalsInput):Prisma.mobile_dentalCreateInput{
        const parsedDate = data.date ? new Date(`${data.date}T00:00:00.000Z`) : null
        return {
            date: parsedDate,
            count:data.count ?? 0,
            address:data.address,
            company:{
                 connect:{company_id:data.company_id,}
            }
        };
    },
    toUpdateInput(data:UpdateMobileDentalnput):Prisma.mobile_dentalUpdateInput{
        return{
            ...(data.status && {status:data.status
            })
        };
    }

}
