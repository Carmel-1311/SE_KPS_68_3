import { useState } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";

type ChangeRolePayload = {
    role?: string;
    license_number?: string | null;
    prefix?: string | null;
};

export function useChangePatientRole() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const changeRole = async (id: number, payload: ChangeRolePayload) => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`/api/patients/${id}/role`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...withAuthHeaders(),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("เปลี่ยน role ไม่สำเร็จ");
            }

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { changeRole, loading, error };
}