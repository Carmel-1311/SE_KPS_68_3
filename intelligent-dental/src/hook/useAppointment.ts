import { useCallback, useEffect, useState } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";
import type { components } from "@/types/api";

/** Type จาก OpenAPI schema */
export type Appointment = components["schemas"]["appointment"];
export type AppointmentStatus = Appointment["status"];

/** Status metadata สำหรับแสดงผล Tag */
export const APPOINTMENT_STATUS_META: Record<AppointmentStatus, { label: string; color: string }> = {
  scheduled:      { label: "รอดำเนินการ",   color: "blue"   },
  completed:      { label: "เสร็จสิ้น",      color: "green"  },
  cancelled:      { label: "ยกเลิกแล้ว",     color: "red"    },
  request_cancel: { label: "ส่งคำขอยกเลิก", color: "orange" },
};

/**
 * Hook สำหรับดึงรายการ appointments ทั้งหมด
 * ใช้ใน: personnel/appointment-schedule/page.tsx
 */
export function useAppointment() {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments?page=1&limit=100", {
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
    async (id: number, status: AppointmentStatus) => {
      const prev = data;
      setData((current) =>
        current.map((item) =>
          item.appointment_id === id ? { ...item, status } : item
        )
      );
      try {
        const res = await fetch(`/api/appointments/${id}`, {
          method: "PUT",
          headers: withAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ status }),
        });
        if (!res.ok) {
          throw new Error("อัปเดตสถานะไม่สำเร็จ");
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