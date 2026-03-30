import { useState } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";
import type { patientInput } from "../types/patients";

export function useCreatePatient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPatient = async (payload: patientInput) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...withAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("สร้างผู้ป่วยไม่สำเร็จ");

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createPatient, loading, error };
}