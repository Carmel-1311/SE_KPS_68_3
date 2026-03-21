import { paths } from "./api";

export type companyResponseList = paths["/api/company"]["get"]["responses"]["200"]["content"]["application/json"];
export type companyList = companyResponseList["data"];

