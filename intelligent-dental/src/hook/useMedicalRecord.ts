import { useState } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";

export interface MedicalRecord {
  id: number;
  date: string;
  history: string;
  status: string;
  detail: {
    id: number;
    diagnosis: string;
    examination_type: {
      id: number;
      name: string;
    };
  }[];
}

export const useMedicalRecord = () => {
  const [loading, setLoading] = useState(false);

  const getMedicalById = async (id: number) => {
    const res = await fetch(
      `/api/medical_records/${id}`,
      { headers: await withAuthHeaders() }
    );
    const data = await res.json();
    return data.data || data;
  };

  // ✅ CREATE
  const createMedical = async (payload: any) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/medical_records`,
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

  return { getMedicalById, createMedical, loading };
};
