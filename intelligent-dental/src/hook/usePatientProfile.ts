import { useCallback, useEffect, useState } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  allergy: string | null;
};

type ApiResponse<T> = {
  data: T;
};

const getPatientId = () => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("patient_id");
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

export function usePatientProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const patientId = getPatientId();
    if (!patientId) {
      setError("ไม่พบข้อมูลบัญชีผู้ใช้");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        headers: withAuthHeaders()
      });
      const result = (await response.json()) as ApiResponse<UserProfile>;
      if (!response.ok) {
        throw new Error((result as { message?: string })?.message || "โหลดข้อมูลไม่สำเร็จ");
      }
      setProfile(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
    setProfile
  };
}
