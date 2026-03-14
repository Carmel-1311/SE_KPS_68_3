import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import * as map from "@/app/mappers/types.mapper"


export async function findAllTypes() {
    return prisma.type.findMany()
}