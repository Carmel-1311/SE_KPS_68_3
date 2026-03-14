import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import * as map from "@/app/mappers/mobile_dentals.mapper"
export async function findAllMobileDental(){
    return prisma.mobile_dental.findMany(map.mobileDentalQuery);
}

export async function findAllByUser(company_id:number ) {
    return prisma.mobile_dental.findMany(
        {where: {company_id:company_id},...map.mobileDentalQuery}
    )
}

export async function findMobileDentalById(id: number) {
    return prisma.mobile_dental.findUnique({
        where: { mobile_dental_id: id },
        ...map.mobileDentalQuery
    })  
}

export async function createMobileDental(data: Prisma.mobile_dentalCreateInput) {
    return prisma.mobile_dental.create({ data, ...map.mobileDentalQuery})
}

export async function updateMobileDental(id: number, data: Prisma.mobile_dentalUpdateInput) {
    return prisma.mobile_dental.update({
        where: { mobile_dental_id: id },
        data,
        ...map.mobileDentalQuery
    })
}

export async function deleteMobileDental(id: number) {
    return prisma.mobile_dental.delete({
        where: { mobile_dental_id: id },
        ...map.mobileDentalQuery
    })
}