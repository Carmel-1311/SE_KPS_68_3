import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"

export async function findAllMobileDental(){
    return prisma.mobile_dental.findMany();
}

export async function findAllByUser(company_id:number ) {
    return prisma.mobile_dental.findMany(
        {where: {company_id:company_id}}
    )
}

export async function findMobileDentalById(id: number) {
    return prisma.mobile_dental.findUnique({
        where: { mobile_dental_id: id },
    })  
}

export async function createMobileDental(data: Prisma.mobile_dentalCreateInput) {
    return prisma.mobile_dental.create({ data})
}

export async function updateMobileDental(id: number, data: Prisma.mobile_dentalUpdateInput) {
    return prisma.mobile_dental.update({
        where: { mobile_dental_id: id },
        data
    })
}

export async function deleteMobileDental(id: number) {
    return prisma.mobile_dental.delete({
        where: { mobile_dental_id: id }
    })
}