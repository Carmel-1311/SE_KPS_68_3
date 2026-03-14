import * as map from "@/app/mappers/patientsMobile.mapper"
import * as repo from "@/repositories/patientsMobileRepository"
import { AppError } from "@/utils/AppError"


export async function getAllByMobile(user: { id: number, role: string },mobile_id:number){
    const pa_mobile = await repo.findPaMoByMobileId(mobile_id);
    if (!pa_mobile) {
        throw new AppError(404, "SCHED-001", "mobile dental record not found", "NOT_FOUND")
    }

    return map.PaMoMap.toResponseList(pa_mobile);
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
      const paMobile = await repo.createPaMo({
        mobile_dental_id: item.mobile_id,
        patient:{
            create:{patient_id:patient.patient_id}
        },
        inspection_record:{
        }
      });

    }

    // ⭐ map response
    return  getAllByMobile(user,list[0].mobile_id);
  }
