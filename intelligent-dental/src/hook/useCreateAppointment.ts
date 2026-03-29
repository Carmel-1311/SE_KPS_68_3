"use client";

import { useState, useCallback, useEffect } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";
import { message } from "antd";
import type { paths } from "@/types/api";

// ── Types ──────────────────────────────────────────────────────────────────────

type CreateAppointmentBody =
  paths["/api/appointments"]["post"]["requestBody"]["content"]["application/json"];

type AvailableSlot =
  paths["/api/appointments/available-slots"]["get"]["responses"][200]["content"]["application/json"]["data"]["available_slots"][number];

export type Patient = {
  id: number;
  name: string;
  email: string;
};

// ── Hook ───────────────────────────────────────────────────────────────────────

/**
 * Hook สำหรับหน้าเพิ่มการนัดหมาย
 *
 * GET /api/patients                        — ดึงรายชื่อคนไข้สำหรับ dropdown
 * GET /api/appointments/available-slots    — ดึงเวลาว่าง
 * POST /api/appointments                   — สร้างการนัดหมายใหม่
 */
export function useCreateAppointment() {
  const [loading, setLoading]           = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [patients, setPatients]         = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // ── Fetch Patients ────────────────────────────────────────────────────────────

  const fetchPatients = useCallback(async () => {
    setLoadingPatients(true);
    try {
      const res = await fetch("/api/patients", {
        headers: withAuthHeaders(),
      });

      if (!res.ok) {
        let errMessage = "โหลดรายชื่อคนไข้ไม่สำเร็จ";
        try {
          const errJson = await res.json();
          if (errJson.error?.message) errMessage = errJson.error.message;
        } catch {}
        throw new Error(errMessage);
      }

      const json = await res.json();
      setPatients(json.data ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "โหลดรายชื่อคนไข้ไม่สำเร็จ";
      message.error(msg);
    } finally {
      setLoadingPatients(false);
    }
  }, []);

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

  // ── Create Appointment ────────────────────────────────────────────────────────

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

  // ── Effects ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // ── Return ────────────────────────────────────────────────────────────────────

  return {
    createAppointment,
    loading,
    availableSlots,
    loadingSlots,
    fetchAvailableSlots,
    patients,
    loadingPatients,
  };
}