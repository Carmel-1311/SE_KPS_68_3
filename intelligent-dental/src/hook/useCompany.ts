import { useCallback, useEffect, useState } from "react";
import type { companyResponseList, companyList } from "@/types/company";
import { withAuthHeaders } from "../app/utils/auth.client";

type Meta = {
  page: number;
  limit: number;
  total: number;
  total_page: number;
};

export function useCompany() {
  const [company, setCompany] = useState<companyList>([]);
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
    total: 0,
    total_page: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================= GET =================
  const fetchCompany = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/company", {
        headers: withAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");

      const data = result.data || [];

      setCompany(data);

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

  // ================= PUT =================
  const updateCompany = async (id: string, payload: any) => {
    try {
      const res = await fetch(`/api/company/${id}`, {
        method: "PUT",
        headers: withAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("อัปเดตไม่สำเร็จ");

      await fetchCompany();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  return {
    company,
    meta,
    loading,
    error,

    refresh: fetchCompany,
    updateCompany,

  };
}