import { components,paths } from "../../types/api"; // path ไปยังไฟล์ api.ts ของคุณ
import { Prisma, type,  } from "@prisma/client";

export type TypesResponse = paths["/api/types"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export const TypesMap={
    toResponseList(list: (type)[]): TypesResponse {
        return list.map(item =>  ({
            id:item.type_id,
            name:item.name??""
        }));
      },
}
