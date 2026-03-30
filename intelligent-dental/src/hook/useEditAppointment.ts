"use client";

import { useState, useCallback, useEffect } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";
import { message } from "antd";
import type { paths } from "@/types/api";

// ── Types ──────────────────────────────────────────────────────────────────────

export type AppointmentDetail =
  paths["/api/appointments/{id}"]["get"]["responses"][200]["content"]["application/json"]["data"];

type UpdateAppointmentBody =
  paths["/api/appointments/{id}"]["put"]["requestBody"]["content"]["application/json"];

type AvailableSlot =
  paths["/api/appointments/available-slots"]["get"]["responses"][200]["content"]["application/json"]["data"]["available_slots"][number];

// ── Hook ───────────────────────────────────────────────────────────────────────

/**
 * Hook สำหรับหน้าแก้ไขการนัดหมาย
 *
 * GET /api/appointments/{id}              — ดึงข้อมูลมา pre-fill ฟอร์ม
 * GET /api/appointments/available-slots   — ดึงเวลาว่างของทันตแพทย์
 * PUT /api/appointments/{id}              — บันทึกการแก้ไข
 * DEL /api/appointments/{id}              — ยกเลิกการนัดหมาย
 */
export function useEditAppointment(id: string | number) {
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots]     = useState(false);

  // ── Fetch Detail ──────────────────────────────────────────────────────────────

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        headers: withAuthHeaders(),
      });

      if (!res.ok) {
        let errMessage = "ไม่พบข้อมูลการนัดหมาย";
        try {
          const errJson = await res.json();
          if (errJson.error?.message) errMessage = errJson.error.message;
        } catch {}
        throw new Error(errMessage);
      }

      const json = await res.json();
      setAppointment(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ดึงข้อมูลไม่สำเร็จ";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ── Fetch Available Slots ─────────────────────────────────────────────────────

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

  // ── Update ────────────────────────────────────────────────────────────────────

  const updateAppointment = useCallback(
    async (body: UpdateAppointmentBody, onSuccess?: () => void) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/appointments/${id}`, {
          method: "PUT",
          headers: withAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          let errMessage = "บันทึกการแก้ไขไม่สำเร็จ";
          try {
            const errJson = await res.json();
            if (errJson.error?.message) errMessage = errJson.error.message;
          } catch {}
          throw new Error(errMessage);
        }

        message.success("บันทึกการแก้ไขเรียบร้อยแล้ว");
        onSuccess?.();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "บันทึกการแก้ไขไม่สำเร็จ";
        message.error(msg);
      } finally {
        setSaving(false);
      }
    },
    [id]
  );

  // ── Delete ────────────────────────────────────────────────────────────────────

  const deleteAppointment = useCallback(
    async (onSuccess?: () => void) => {
      try {
        const res = await fetch(`/api/appointments/${id}`, {
          method: "DELETE",
          headers: withAuthHeaders(),
        });

        // DELETE คืน 204 No Content ถือว่าสำเร็จ
        if (!res.ok) {
          let errMessage = "ยกเลิกการนัดหมายไม่สำเร็จ";
          try {
            const errJson = await res.json();
            if (errJson.error?.message) errMessage = errJson.error.message;
          } catch {}
          throw new Error(errMessage);
        }

        message.success("ยกเลิกการนัดหมายเรียบร้อยแล้ว");
        onSuccess?.();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "ยกเลิกการนัดหมายไม่สำเร็จ";
        message.error(msg);
      }
    },
    [id]
  );

  // ── Effects ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (id) fetchDetail();
  }, [id, fetchDetail]);

  // ── Return ────────────────────────────────────────────────────────────────────

  return {
    appointment,
    loading,
    saving,
    availableSlots,
    loadingSlots,
    fetchAvailableSlots,
    updateAppointment,
    deleteAppointment,
    refresh: fetchDetail,
  };
}
