import { useCallback, useEffect, useState } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";
import type { ApiResponse, User } from "@/types/user";

const getPatientId = () => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("patient_id");
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(
    async (payload: {
      id: number;
      name: string;
      birthday: string;
      allergy?: string | null;
      email: string;
      phone: string;
    }) => {
      const allergy = payload.allergy ?? "";
      const [firstName, ...rest] = payload.name.trim().split(" ");
      const lastName = rest.join(" ");
      const response = await fetch(`/api/patients/${payload.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...withAuthHeaders()
        },
        body: JSON.stringify({
          first_name: firstName || payload.name,
          last_name: lastName,
          birthday: payload.birthday,
          allergy,
          email: payload.email,
          phone: payload.phone
        })
      });

      const result = (await response.json()) as {
        data?: User;
        error?: { message?: string };
        message?: string;
      };
      if (!response.ok) {
        throw new Error(
          result?.error?.message ||
            result?.message ||
            "บันทึกไม่สำเร็จ"
        );
      }

      const updated = result.data ?? { ...payload, allergy };
      setUser(updated);
      return updated;
    },
    []
  );

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
      const result = (await response.json()) as ApiResponse<User>;
      if (!response.ok) {
        throw new Error((result as { message?: string })?.message || "โหลดข้อมูลไม่สำเร็จ");
      }
      setUser(result.data);
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
    user,
    loading,
    error,
    refresh: fetchProfile,
    setUser,
    updateProfile
  };
}
