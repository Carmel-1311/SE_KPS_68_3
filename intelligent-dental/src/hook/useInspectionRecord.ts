import { useState } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";

export interface InspectionRecord {
  id: number;
  date: string;
  history: string;
  status: string;
}

export const useInspectionRecord = () => {
  const [loading, setLoading] = useState(false);

  const getInspectionById = async (id: number) => {
    const res = await fetch(
      `/api/inspection_records/${id}`,
      { headers: await withAuthHeaders() }
    );
    const data = await res.json();
    return data.data || data;
  };

  const createInspection = async (payload: any) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/inspection_records`,
        {
          method: "POST",
          headers: await withAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      return data.data || data;
    } finally {
      setLoading(false);
    }
  };

  return { getInspectionById, createInspection, loading };
};