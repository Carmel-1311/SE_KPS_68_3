"use client";

import { useState, useCallback, useEffect } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";
import { message } from "antd";
import type { paths } from "@/types/api";

// ── Types ──────────────────────────────────────────────────────────────────────

export type MobileDentalDetail =
  paths["/api/mobile_dentals/{id}"]["get"]["responses"][200]["content"]["application/json"]["data"];

type UpdateMobileDentalBody =
  paths["/api/mobile_dentals/{id}"]["put"]["requestBody"]["content"]["application/json"];

export type MobileDentalStatus = MobileDentalDetail["status"];

// ── Hook ───────────────────────────────────────────────────────────────────────

/**
 * Hook สำหรับหน้าดูรายละเอียด/แก้การออกหน่วย
 *
 * GET /api/mobile_dentals/{id}  — ดึงข้อมูลมาแสดงและ pre-fill ฟอร์ม
 * PUT /api/mobile_dentals/{id}  — บันทึกการแก้ไข (company + status)
 */
export function useMobileDentalDetail(id: string | number) {
  const [mobileDental, setMobileDental] = useState<MobileDentalDetail | null>(null);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);

  // ── Fetch Detail ──────────────────────────────────────────────────────────────

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mobile_dentals/${id}`, {
        headers: withAuthHeaders(),
      });

      if (!res.ok) {
        let errMessage = "ไม่พบข้อมูลการออกหน่วย";
        try {
          const errJson = await res.json();
          if (errJson.error?.message) errMessage = errJson.error.message;
        } catch {}
        throw new Error(errMessage);
      }

      const json = await res.json();
      setMobileDental(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ดึงข้อมูลไม่สำเร็จ";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ── Update ────────────────────────────────────────────────────────────────────

  /**
   * PUT /api/mobile_dentals/{id}
   * รับแค่ body: { company: { id, office_name }, status }
   */
  const updateMobileDental = useCallback(
    async (body: UpdateMobileDentalBody, onSuccess?: () => void) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/mobile_dentals/${id}`, {
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

        const json = await res.json();
        setMobileDental(json.data); // อัปเดต state ให้ตรงกับข้อมูลล่าสุด
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

  // ── Effects ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (id) fetchDetail();
  }, [id, fetchDetail]);

  // ── Return ────────────────────────────────────────────────────────────────────

  return {
    mobileDental, // ข้อมูลการออกหน่วย
    loading,      // กำลังโหลดอยู่ไหม
    saving,       // กำลัง save อยู่ไหม
    updateMobileDental,
    refresh: fetchDetail,
  };
}
