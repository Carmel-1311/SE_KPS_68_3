import { components, paths } from "../../types/api"; // path ไปยังไฟล์ api.ts ของคุณ
import { Prisma, mobile_dental, company } from "@prisma/client";
import { toUpdateAppointmentInput } from "./appointment.mapper";

export type MobileDentalsResponse = components["schemas"]["mobile_dental"];
export type CreateMobileDentalsInput =  paths["/api/mobile_dentals"]["post"]["requestBody"]["content"]["application/json"];
export type UpdateMobileDentalnput = paths["/api/mobile_dentals/{id}"]["put"]["requestBody"]["content"]["application/json"];
export const MobileDentalsMap = {
    toRespons(data : mobile_dental & { company: company }): MobileDentalsResponse {
        return {
            mobile_dental_id:data.mobile_dental_id,
            company_id:data.company?.company_id ?? null,
            date: data.date?.toISOString() ?? "",
            count: data.count ?? 0,
            status:data.status ?? "request",
            address:data.address ?? ""
        };
    },
    toResponseList(list:( mobile_dental & { company: company })[]): MobileDentalsResponse[]{
        return list.map(item => this.toRespons(item));
    },
    toCreateInput(data:CreateMobileDentalsInput):Prisma.mobile_dentalCreateInput{
        return {
            date: data.date,
            count:data.count ?? 0,
            address:data.address
        };
    },
    toUpdateInput(data:UpdateMobileDentalnput):Prisma.mobile_dentalUpdateInput{
        return{
            ...(data.status && {status:data.status
            })
        };
    }

}