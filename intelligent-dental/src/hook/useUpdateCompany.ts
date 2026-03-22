import { useCallback, useEffect, useState } from "react";
import type {  companyData } from "@/types/company";
import { withAuthHeaders } from "../app/utils/auth.client";


export function useUpdateCompany() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCompany = async (id: number, payload: any) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/company/${id}`, {
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

  return { updateCompany, loading, error };
}