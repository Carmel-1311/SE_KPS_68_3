"use client";

import { useState, useCallback } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";
import { message } from "antd";
import type { paths } from "@/types/api";

type CreateAppointmentBody =
  paths["/api/appointments"]["post"]["requestBody"]["content"]["application/json"];

type AvailableSlot =
  paths["/api/appointments/available-slots"]["get"]["responses"][200]["content"]["application/json"]["data"]["available_slots"][number];

/**
 * Hook สำหรับดึง available slots และเพิ่มการนัดหมายใหม่
 * GET /api/appointments/available-slots?date=...
 * POST /api/appointments
 */
export function useCreateAppointment() {
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // ดึง available slots ตามวันที่ที่เลือก
  const fetchAvailableSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    setAvailableSlots([]);

    try {
      const res = await fetch(`/api/appointments/available-slots?date=${date}`, {
        headers: withAuthHeaders(),
      });

      if (!res.ok) {
        let errMessage = "โหลดเวลาว่างไม่สำเร็จ";
        try {
          const errJson = await res.json();
          if (errJson.error?.message) errMessage = errJson.error.message;
        } catch {}
        throw new Error(errMessage);
      }

      const json = await res.json();
      setAvailableSlots(json.data?.available_slots ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "โหลดเวลาว่างไม่สำเร็จ";
      message.error(msg);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // สร้างการนัดหมายใหม่
  const createAppointment = useCallback(
    async (body: CreateAppointmentBody, onSuccess?: () => void) => {
      setLoading(true);

      try {
        const res = await fetch("/api/appointments", {
          method: "POST",
          headers: withAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          let errMessage = "เพิ่มการนัดหมายไม่สำเร็จ";
          try {
            const errJson = await res.json();
            if (errJson.error?.message) errMessage = errJson.error.message;
          } catch {}
          throw new Error(errMessage);
        }

        message.success("เพิ่มการนัดหมายเรียบร้อยแล้ว");
        onSuccess?.();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "เพิ่มการนัดหมายไม่สำเร็จ";
        message.error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createAppointment,
    loading,
    availableSlots,
    loadingSlots,
    fetchAvailableSlots,
  };
}
