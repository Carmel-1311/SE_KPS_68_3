import { useCallback, useEffect, useState } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";
import type { components } from "@/types/api";

/** Type จาก OpenAPI schema */
export type MobileDental = components["schemas"]["mobile_dental"];
export type MobileDentalStatus = MobileDental["status"];

/** Status metadata สำหรับแสดงผล Tag */
export const STATUS_META: Record<MobileDentalStatus, { label: string; color: string }> = {
  request:        { label: "รออนุมัติ",   color: "blue"    },
  scheduled:      { label: "อนุมัติแล้ว", color: "green"   },
  completed:      { label: "เสร็จสิ้น",   color: "cyan"    },
  request_cancel: { label: "คำขอยกเลิก", color: "orange"  },
  cancel:         { label: "ยกเลิกแล้ว",  color: "default" },
};

/** Tab key → status mapping */
export const TAB_STATUS: Record<string, MobileDentalStatus> = {
  "1": "request",
  "2": "scheduled",
  "3": "completed",
  "4": "request_cancel",
};

/**
 * Hook สำหรับดึงรายการ mobile_dentals ทั้งหมด
 * ใช้ใน: personnel/mission/page.tsx
 */
export function useMission() {
  const [data, setData] = useState<MobileDental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mobile_dentals?page=1&limit=100", {
        cache: "no-store",
        headers: withAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error("โหลดข้อมูลไม่สำเร็จ");
      }
      const json = await res.json();
      setData(json.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(
    async (id: number, status: MobileDentalStatus) => {
      const prev = data;
      setData((current) =>
        current.map((item) =>
          item.mobile_dental_id === id ? { ...item, status } : item
        )
      );
      try {
        const res = await fetch(`/api/mobile_dentals/${id}`, {
          method: "PUT",
          headers: withAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ status }),
        });
        if (!res.ok) {
          throw new Error("โหลดข้อมูลไม่สำเร็จ");
        }
      } catch (err) {
        setData(prev);
        throw err;
      }
    },
    [data]
  );

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const requestCancelCount = data.filter(
    (item) => item.status === "request_cancel"
  ).length;

  return { data, loading, error, refresh: fetchData, updateStatus, requestCancelCount };
}