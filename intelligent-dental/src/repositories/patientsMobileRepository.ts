import { Prisma } from "@prisma/client"
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
        patient: true
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

export async function updatePaMoFull(
  id: number,
  data: {
    pamo: Prisma.patient_in_mobileUpdateInput
    patient: Prisma.patientUpdateInput
  }
) {
  return prisma.$transaction(async (tx) => {

    const pamo = await tx.patient_in_mobile.update({
      where: { patient_in_mobile_id: id },
      data: data.pamo
    })

    if (Object.keys(data.patient).length > 0) {
      await tx.patient.update({
        where: { patient_id: pamo.patient_id },
        data: data.patient
      })
    }

    return pamo
  })
}

export async function deletePaMo(id: number) {
  return prisma.patient_in_mobile.delete({
    where: { patient_in_mobile_id: id }
  })
}

export function findById(id: number) {
  return prisma.patient_in_mobile.findUnique({
    where: { patient_in_mobile_id: id },
    include: {
      patient: true,
      inspection_record: true
    }
  })
}