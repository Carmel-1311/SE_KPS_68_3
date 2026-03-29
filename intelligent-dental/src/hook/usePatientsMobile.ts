import { useState, useCallback, useEffect, useRef } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";
import { message } from "antd";
import type { paths } from "@/types/api";

type PatientsListResponse =
  paths["/api/mobile_dentals/{id}/patients"]["get"]["responses"]["200"]["content"]["application/json"];
type MissionResponse =
  paths["/api/mobile_dentals/{id}"]["get"]["responses"]["200"]["content"]["application/json"]["data"];
type AddPatientsBody =
  paths["/api/mobile_dentals/{id}/patients"]["post"]["requestBody"]["content"]["application/json"];
type UpdatePatientBody =
  paths["/api/mobile_dentals/patients/{id}"]["put"]["requestBody"]["content"]["application/json"];

export type PatientMobile = PatientsListResponse["data"][number];
export type MissionDetail = MissionResponse;
export type PatientDraftInput = Omit<AddPatientsBody[number], "mobile_id">;

async function getApiErrorMessage(res: Response, fallback: string) {
  try {
    const json = (await res.json()) as { error?: { message?: string }; message?: string };
    return json.error?.message || json.message || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Hook สำหรับจัดการรายชื่อผู้ป่วยใน Mobile Dental Mission
 * ใช้ใน: company/status/[id]/patients/page.tsx
 */
export function usePatientsMobile(mobileDentalId: string) {
  const [patients, setPatients] = useState<PatientMobile[]>([]);
  const [mission, setMission] = useState<MissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const processingIdsRef = useRef<Set<number>>(new Set());

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const limit = 100;
      let page = 1;
      let totalPages = 1;
      const all: PatientMobile[] = [];

      while (page <= totalPages) {
        const query = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        const res = await fetch(`/api/mobile_dentals/${mobileDentalId}/patients?${query.toString()}`, {
          cache: "no-store",
          headers: withAuthHeaders(),
        });

        if (!res.ok) {
          throw new Error(await getApiErrorMessage(res, "โหลดรายชื่อไม่สำเร็จ"));
        }

        const json = (await res.json()) as PatientsListResponse;
        all.push(...(json.data || []));
        totalPages = Math.max(1, json.meta?.total_pages || 1);
        page += 1;
      }

      setPatients(all);
      return all;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "โหลดรายชื่อผู้รับบริการไม่สำเร็จ";
      message.error(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, [mobileDentalId]);

  const fetchMission = useCallback(async () => {
    try {
      const res = await fetch(`/api/mobile_dentals/${mobileDentalId}`, {
        headers: withAuthHeaders(),
      });
      if (!res.ok) throw new Error(await getApiErrorMessage(res, "โหลดรายละเอียดภารกิจไม่สำเร็จ"));
      const json = (await res.json()) as { data: MissionDetail };
      setMission(json.data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "โหลดรายละเอียดภารกิจไม่สำเร็จ";
      message.error(errorMsg);
    }
  }, [mobileDentalId]);

  /**
   * เพิ่มรายชื่อผู้ป่วยแบบกลุ่ม (bulk)
   */
  const addPatientsBulk = useCallback(async (list: PatientDraftInput[]) => {
    if (list.length === 0 || submitting) return false;

    const mobileId = Number(mobileDentalId);
    if (!Number.isInteger(mobileId) || mobileId <= 0) {
      message.error("รหัสคำขอไม่ถูกต้อง");
      return false;
    }

    setSubmitting(true);
    try {
      const payload: AddPatientsBody = list.map((item) => ({
        ...item,
        mobile_id: mobileId,
      }));

      const res = await fetch(`/api/mobile_dentals/${mobileDentalId}/patients`, {
        method: "POST",
        headers: withAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, "บันทึกข้อมูลไม่สำเร็จ"));
      }

      message.success("บันทึกข้อมูลรายชื่อสำเร็จ");
      await fetchPatients();
      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "บันทึกข้อมูลไม่สำเร็จ";
      message.error(errorMsg);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchPatients, mobileDentalId, submitting]);

  const updatePatient = useCallback(
    async (id: number, body: UpdatePatientBody) => {
      if (processingIdsRef.current.has(id)) return false;

      processingIdsRef.current.add(id);
      setProcessingIds([...processingIdsRef.current]);

      try {
        const res = await fetch(`/api/mobile_dentals/patients/${id}`, {
          method: "PUT",
          headers: withAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          throw new Error(await getApiErrorMessage(res, "แก้ไขข้อมูลไม่สำเร็จ"));
        }

        await fetchPatients();
        message.success("แก้ไขข้อมูลสำเร็จ");
        return true;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "แก้ไขข้อมูลไม่สำเร็จ";
        message.error(errorMsg);
        return false;
      } finally {
        processingIdsRef.current.delete(id);
        setProcessingIds([...processingIdsRef.current]);
      }
    },
    [fetchPatients]
  );

  const deletePatient = useCallback(
    async (id: number) => {
      if (processingIdsRef.current.has(id)) return false;

      processingIdsRef.current.add(id);
      setProcessingIds([...processingIdsRef.current]);

      try {
        const res = await fetch(`/api/mobile_dentals/patients/${id}`, {
          method: "DELETE",
          headers: withAuthHeaders(),
        });

        if (!res.ok) {
          throw new Error(await getApiErrorMessage(res, "ลบข้อมูลไม่สำเร็จ"));
        }

        await fetchPatients();
        message.success("ลบข้อมูลสำเร็จ");
        return true;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "ลบข้อมูลไม่สำเร็จ";
        message.error(errorMsg);
        return false;
      } finally {
        processingIdsRef.current.delete(id);
        setProcessingIds([...processingIdsRef.current]);
      }
    },
    [fetchPatients]
  );


  useEffect(() => {
    if (mobileDentalId) {
      void fetchPatients();
      void fetchMission();
    }
  }, [mobileDentalId, fetchPatients, fetchMission]);

  return {
    patients,
    mission,
    loading,
    submitting,
    processingIds,
    refresh: fetchPatients,
    addPatientsBulk,
    updatePatient,
    deletePatient,
  };
}
