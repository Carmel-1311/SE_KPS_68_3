import { prisma } from "@/utils/prisma"


export async function findAllTypes(skip: number, take: number) {
    return prisma.type.findMany({
        skip,
        take,
        orderBy: { type_id: "asc" }
    })
}

export async function countTypes() {
    return prisma.type.count()
}
