import { useCallback, useEffect, useState } from "react";
import type { patientResponseList, patientList } from "../types/patients";
import { withAuthHeaders } from "../app/utils/auth.client";

type Meta = {
  page: number;
  limit: number;
  total: number;
  total_page: number;
};

export function usePatients() {
  const [patients, setPatients] = useState<patientList>([]);
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
    total: 0,
    total_page: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/patients?page=1&limit=200", {
        headers: withAuthHeaders(),
      });

      const result = (await response.json()) as patientResponseList;

      if (!response.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลรายชื่อได้");
      }

      const data = result.data || [];

      setPatients(data);

      const limit = 10;
      const total = data.length;

      setMeta({
        page: 1,
        limit,
        total,
        total_page: Math.ceil(total / limit),
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    meta, 
    loading,
    error,
    refresh: fetchPatients,
  };
}