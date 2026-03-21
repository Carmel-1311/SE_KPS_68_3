import { paths } from "./api";

export type patientResponseList = paths["/api/patients"]["get"]["responses"]["200"]["content"]["application/json"];
export type patientList = patientResponseList["data"];

export type patientResponse = paths["/api/patients/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
export type patientData = patientResponse["data"];