import * as map from "@/app/mappers/types.mapper"
import * as repo from "@/repositories/typesRepository"

export async function getAllTypes(): Promise<ReturnType<typeof map.TypesMap.toResponseList>> {
        return map.TypesMap.toResponseList(await repo.findAllTypes(0, 100))
}

export async function getAllTypesPaginated(limit: number, page: number) {
        const [types, total] = await Promise.all([
                repo.findAllTypes((page - 1) * limit, limit),
                repo.countTypes()
        ])

        return {
                data: map.TypesMap.toResponseList(types),
                total
        }
}
