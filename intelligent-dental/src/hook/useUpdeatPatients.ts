import { useCallback, useEffect, useState } from "react";
import type {  patientupdate } from "@/types/patients";
import { withAuthHeaders } from "../app/utils/auth.client";


export function useUpdatePatients() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePatients = async (id: number, payload: patientupdate) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/patients/${id}`, {
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

      const data = await res.json();
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updatePatients, loading, error };
}