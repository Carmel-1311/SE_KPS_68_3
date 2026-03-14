import * as map from "@/app/mappers/types.mapper"
import * as repo from "@/repositories/typesRepository"

export async function getAllTypes(): Promise<ReturnType<typeof map.TypesMap.toResponseList>> {
        return map.TypesMap.toResponseList(await repo.findAllTypes())

}