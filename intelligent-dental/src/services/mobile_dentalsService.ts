import * as map from "@/app/mappers/mobile_dentals.mapper"
import * as repo from "@/repositories/mobile_dentalsRepository"
import { AppError } from "@/utils/AppError"
import { UpdateMobileDentalnput,CreateMobileDentalsInput } from "@/app/mappers/mobile_dentals.mapper"

export async function getAllMobileDentalsByUser(user: { id: number, role: string }): Promise<map.MobileDentalsResponse[]> {
    if (user.role === "company") {
        return map.MobileDentalsMap.toResponseList(await repo.findAllByUser(user.id))
    }
    else {
        return map.MobileDentalsMap.toResponseList(await repo.findAllMobileDental())
    }
}

export async function getMobileDentalsById(id: number) 
: Promise<ReturnType<typeof map.MobileDentalsMap.toRespons>> {

    const mobile = await repo.findMobileDentalById(id)

    if (!mobile) {
        throw new AppError(404, "SCHED-001", "inspection record not found", "NOT_FOUND")
    }
    
    return map.MobileDentalsMap.toRespons(mobile)
}

export async function createMobileDentals(data: CreateMobileDentalsInput) {
    const mobile = await repo.createMobileDental(map.MobileDentalsMap.toCreateInput(data))
    return getMobileDentalsById(mobile.mobile_dental_id)
}

export async function updateMobileDentals(id: number, data: UpdateMobileDentalnput) {
    
    const existingmobile = await repo.findMobileDentalById(id)
    if (!existingmobile) {
        throw new AppError(404, "SCHED-001", "inspection record not found", "NOT_FOUND")
    }
    const updatedmobile = await repo.updateMobileDental(id, map.MobileDentalsMap.toUpdateInput(data))
    return getMobileDentalsById(id)
}

export async function deleteMobileDentals(id: number) {
    // Check if mobile exists before deleting to provide meaningful error message
    const existingmobile = await repo.findMobileDentalById(id)
    if (!existingmobile) {
        throw new AppError(404, "SCHED-001", "inspection record not found", "NOT_FOUND")
    }
    return repo.deleteMobileDental(id)
}
