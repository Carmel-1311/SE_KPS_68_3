import { paths } from "./api";

export type companyResponseList = paths["/api/company"]["get"]["responses"]["200"]["content"]["application/json"];
export type companyList = companyResponseList["data"];


export type companyResponse = paths["/api/company/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
export type companyData = companyResponse["data"];

