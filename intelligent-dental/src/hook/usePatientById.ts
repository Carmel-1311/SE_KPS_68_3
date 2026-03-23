import { useCallback, useEffect, useState } from "react";
import type { patientData } from "../types/patients";
import { withAuthHeaders } from "../app/utils/auth.client";


export function usePatientById(id: number) {
  const [patients, setPatient] = useState<patientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || isNaN(id)) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/patients/${id}`, {
          headers: withAuthHeaders(),
        });

        if (!res.ok) {
          throw new Error("โหลดข้อมูลไม่สำเร็จ");
        }

        const data = await res.json();

        setPatient(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { patients, loading, error };
}