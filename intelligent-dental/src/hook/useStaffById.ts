import { useCallback, useEffect, useState } from "react";
import type {staffData } from "../types/staff";
import { withAuthHeaders } from "../app/utils/auth.client";


export function useStaffById(id: number) {
  const [staffs, setStaff] = useState<staffData | null >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || isNaN(id)) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/staffs/${id}`, {
          headers: withAuthHeaders(),
        });

        if (!res.ok) {
          throw new Error("โหลดข้อมูลไม่สำเร็จ");
        }

        const data = await res.json();

        setStaff(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        setStaff(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { staffs, loading, error };
}