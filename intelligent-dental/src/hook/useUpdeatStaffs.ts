import { useCallback, useEffect, useState } from "react";
import type {  staffUpdatePayload } from "@/types/staff";
import { withAuthHeaders } from "../app/utils/auth.client";


export function useUpdateStaff() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStaff = async (id: number, payload: staffUpdatePayload) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/staffs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...withAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("อัปเดตไม่สำเร็จ");
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateStaff, loading, error };
}