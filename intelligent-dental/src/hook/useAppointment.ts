"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";
import { message } from "antd";
import type { paths } from "@/types/api";

// ── Types ──────────────────────────────────────────────────────────────────────

export type Appointment =
  paths["/api/appointments"]["get"]["responses"][200]["content"]["application/json"]["data"][number];

type UpdateAppointmentBody =
  paths["/api/appointments/{id}"]["put"]["requestBody"]["content"]["application/json"];

// ── Constants ──────────────────────────────────────────────────────────────────

/** Meta สำหรับแสดงสถานะ (สี + label ภาษาไทย) */
export const APPOINTMENT_STATUS_META: Record<string, { color: string; label: string }> = {
  scheduled:      { color: "blue",   label: "รอดำเนินการ"     },
  completed:      { color: "green",  label: "เสร็จสิ้น"       },
  cancelled:      { color: "red",    label: "ยกเลิกแล้ว"      },
  request_cancel: { color: "orange", label: "ขอยกเลิกนัดหมาย" },
};

// ── Hook ───────────────────────────────────────────────────────────────────────

/**
 * Hook สำหรับหน้าตารางนัดหมาย
 *
 * GET /api/appointments      — ดึงข้อมูลทุกหน้าแล้วรวมไว้
 * PUT /api/appointments/{id} — อัปเดตสถานะ (เช่น ยืนยันยกเลิก)
 */
export function useAppointment() {
  const [data, setData]     = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // 1. โหลดหน้าแรกก่อน เพื่อรู้ total_pages
      const firstRes = await fetch("/api/appointments?page=1&limit=10", {
        headers: withAuthHeaders(),
        signal: controller.signal,
      });

      if (!firstRes.ok) {
        let errMessage = "โหลดข้อมูลไม่สำเร็จ";
        try {
          const errJson = await firstRes.json();
          if (errJson.error?.message) errMessage = errJson.error.message;
        } catch {}
        throw new Error(errMessage);
      }

      const firstJson = await firstRes.json();
      const totalPages: number    = firstJson.meta?.total_pages ?? 1;
      const allData: Appointment[] = [...(firstJson.data ?? [])];

      // 2. ถ้ามีมากกว่า 1 หน้า โหลดที่เหลือพร้อมกัน
      if (totalPages > 1) {
        const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);

        const results = await Promise.all(
          remainingPages.map((page) =>
            fetch(`/api/appointments?page=${page}&limit=10`, {
              headers: withAuthHeaders(),
              signal: controller.signal,
            }).then((r) => r.json())
          )
        );

        results.forEach((json) => allData.push(...(json.data ?? [])));
      }

      if (!controller.signal.aborted) {
        setData(allData);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ";
      setError(msg);
      message.error(msg);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────────

  /** อัปเดตสถานะนัดหมาย แล้วอัปเดต local state ทันทีโดยไม่ต้อง fetch ใหม่ */
  const updateStatus = useCallback(
    async (id: number, status: UpdateAppointmentBody["status"]) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: withAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        let errMessage = "อัปเดตสถานะไม่สำเร็จ";
        try {
          const errJson = await res.json();
          if (errJson.error?.message) errMessage = errJson.error.message;
        } catch {}
        throw new Error(errMessage);
      }

      setData((prev) =>
        prev.map((item) =>
          item.appointment_id === id ? { ...item, status } : item
        )
      );
    },
    []
  );

  // ── Effects ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchAll();
    return () => { abortRef.current?.abort(); };
  }, [fetchAll]);

  // ── Derived State ─────────────────────────────────────────────────────────────

  /** จำนวนคำขอยกเลิกสำหรับ Badge */
  const requestCancelCount = data.filter(
    (item) => item.status === "request_cancel"
  ).length;

  // ── Return ────────────────────────────────────────────────────────────────────

  return {
    data,
    loading,
    error,
    updateStatus,
    requestCancelCount,
    refresh: fetchAll,
  };
}