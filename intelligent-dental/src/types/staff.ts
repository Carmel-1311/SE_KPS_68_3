import { paths } from "./api";

export type staffResponseList = paths["/api/staff"]["get"]["responses"]["200"]["content"]["application/json"];
export type staffList = staffResponseList["data"];

export type staffResponse = paths["/api/staff/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
export type staffData = staffResponse["data"];