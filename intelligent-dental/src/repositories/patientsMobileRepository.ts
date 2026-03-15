import { Prisma } from "@prisma/client"
import * as map from "@/app/mappers/patientsMobile.mapper"
import { prisma } from "@/utils/prisma"


export async function findPaMoByMobileId(
  mobile_dental_id: number,
  skip: number,
  limit: number
) {

  const [data, total] = await Promise.all([
    prisma.patient_in_mobile.findMany({
      where: { mobile_dental_id },
      skip,
      take: limit,
      include: {
        patient: true,
        mobile_dental: true
      }
    }),
    prisma.patient_in_mobile.count({
      where: { mobile_dental_id }
    })
  ])

  return { data, total }
}

export async function createPaMo(data: Prisma.patient_in_mobileCreateInput) {
    return prisma.patient_in_mobile.create({ data})
}

export const patientRepository = {

  findByIdCard(idcard: string) {
    return prisma.patient.findUnique({
      where: { id_card: idcard }
    });
  },

  create(data:any) {
    return prisma.patient.create({
      data
    });
  }

};
