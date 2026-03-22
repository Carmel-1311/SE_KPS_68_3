import * as map from "@/app/mappers/patientsMobile.mapper"
import * as repo from "@/repositories/patientsMobileRepository"
import * as repMo from "@/repositories/mobile_dentalsRepository"
import { AppError } from "@/utils/AppError"


export async function getAllByMobile(
  user: { id: number, role: string },
  mobile_id: number,
  page: number,
  limit: number
): Promise<{
  data: ReturnType<typeof map.PaMoMap.toResponseList>
  total: number
}> {

  const skip = (page - 1) * limit

  const mobile = await repMo.findMobileDentalById(mobile_id)

  if (!mobile) {
    throw new AppError(
      404,
      "SCHED-001",
      "mobile dental record not found",
      "NOT_FOUND"
    )
  }

  const result = await repo.findPaMoByMobileId(mobile_id, skip, limit)

  return {
    data: map.PaMoMap.toResponseList(result.data),
    total: result.total
  }
}

export async function createPatients(user: { id: number, role: string },list: map.CreatePaMobileInput) {

    for (const item of list) {

      // 1️⃣ หา patient จาก idcard
      let patient = await repo.patientRepository.findByIdCard(item.idcard);

      // 2️⃣ ถ้าไม่มี -> create patient
      if (!patient) {
        patient = await repo.patientRepository.create({
          first_name: item.first_name,
          last_name: item.last_name,
          id_card: item.idcard,
          phone: item.phone ?? "",
          birthday: item.birthday ? new Date(item.birthday) : null
        });
      }

      // 3️⃣ create patient_in_mobile
      await repo.createPaMo({
        mobile_dental_id: item.mobile_id,
        patient: {
          connect: { patient_id: patient.patient_id }
        }
      });

    }

    return  getAllByMobile(user,list[0].mobile_id,1,10);
  }

export async function updatePatients(
  user: { id: number, role: string },
  id: number,
  body: map.UpdatePaMobileInput
) {

  const result = await repo.updatePaMoFull(
    id,
    map.PaMoMap.toUpdateInput(body)
  )

  return getAllByMobile(user, result.mobile_dental_id, 1, 10)
}

export async function deletePatients(
  user: { id: number; role: string },
  id: number
) {

  const existing = await repo.findById(id)

  if (!existing) {
    throw new AppError(
      404,
      "PAMO-404",
      "patient_in_mobile not found",
      "NOT_FOUND"
    )
  }

  await repo.deletePaMo(id)

  return getAllByMobile(user, existing.mobile_dental_id, 1, 10)
}