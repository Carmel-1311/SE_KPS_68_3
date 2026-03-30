import { paths } from "./api";

export type staffResponseList = paths["/api/staffs"]["get"]["responses"]["200"]["content"]["application/json"];
export type staffList = staffResponseList["data"];

export type staffResponse = paths["/api/staffs/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
export type staffData = staffResponse["data"];
export type staffupdate = paths["/api/staff/{id}"]["put"]["requestBody"]["content"]["application/json"];
export type staffUpdatePayload = staffupdate;