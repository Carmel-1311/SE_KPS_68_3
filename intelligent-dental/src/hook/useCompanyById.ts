import { useCallback, useEffect, useState } from "react";
import type {  companyData } from "@/types/company";
import { withAuthHeaders } from "../app/utils/auth.client";


export function useCompanyById(id: number) {
  const [company, setCompany] = useState<companyData | null >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || isNaN(id)) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/company/${id}`, {
          headers: withAuthHeaders(),
        });

        if (!res.ok) {
          throw new Error("โหลดข้อมูลไม่สำเร็จ");
        }

        const data = await res.json();

        setCompany(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { company, loading, error };
}