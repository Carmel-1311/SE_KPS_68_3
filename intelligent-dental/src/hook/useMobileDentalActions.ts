"use client";

import { useState, useCallback, useRef } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";
import { message } from "antd";
import type { paths } from "@/types/api";

type UpdateMobileDentalBody =
  paths["/api/mobile_dentals/{id}"]["put"]["requestBody"]["content"]["application/json"];

/**
 * Hook สำหรับจัดการ Action ต่างๆ ของ Mobile Dental
 * เช่น การอัปเดตสถานะ (ขอรับบริการ, ขอยกเลิก)
 */
export function useMobileDentalActions() {
  // ใช้ useRef เพื่อดัก state ป้องกัน race condition และไม่ต้องใส่ใน deps
  const updatingIdsRef = useRef<Set<number>>(new Set());
  // ใช้ useState เพื่อกระตุ้นให้ UI re-render เท่านั้น
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);

  const updateStatus = useCallback(async (id: number, body: UpdateMobileDentalBody, onSuccess?: () => void) => {
    if (updatingIdsRef.current.has(id)) return;

    updatingIdsRef.current.add(id);
    setUpdatingIds([...updatingIdsRef.current]);

    try {
      const res = await fetch(`/api/mobile_dentals/${id}`, {
        method: "PUT",
        headers: withAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let errMessage = "ดำเนินการไม่สำเร็จ";
        try {
          const errJson = await res.json();
          if (errJson.error?.message) {
            errMessage = errJson.error.message;
          }
        } catch { }
        throw new Error(errMessage);
      }

      message.success({ content: "ดำเนินการสำเร็จ", key: `update-status-${id}` });
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ดำเนินการไม่สำเร็จ";
      message.error({ content: msg, key: `update-status-${id}` });
    } finally {
      updatingIdsRef.current.delete(id);
      setUpdatingIds([...updatingIdsRef.current]);
    }
  }, []);

  return {
    updateStatus,
    updatingIds,
  };
}
