import { useState, useEffect, useCallback } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";

export const useDentist = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // เพิ่ม state สำหรับ mobile dental และ mobile patients
  const [mobileDentals, setMobileDentals] = useState<any[]>([]);
  const [mobilePatients, setMobilePatients] = useState<any[]>([]);
  const [loadingMobilePatients, setLoadingMobilePatients] = useState<boolean>(false);

  // ดึงรายชื่อทั้งหมด (มีแค่ id, name, email)
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/patients", {
        headers: withAuthHeaders()  // ✅ เพิ่ม header สำหรับ auth
      });
      const result = await response.json();
      setPatients(result.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ดึงรายชื่อ mobile dental ที่ status = scheduled
  const fetchMobileDentals = useCallback(async () => {
    try {
      const response = await fetch("/api/mobile_dentals?page=1&limit=50", {
        headers: withAuthHeaders()
      });
      const result = await response.json();
      console.log("[MOBILE DENTALS API RESULT]", result.data);
      setMobileDentals(
        (result.data || []).filter((m: any) =>
          (m.status || "").toLowerCase() === "scheduled"
        )
      );
    } catch (err) {
      console.error("Fetch mobile dentals error:", err);
      setMobileDentals([]);
    }
  }, []);

  // ดึงรายชื่อผู้ป่วยใน mobile dental ตาม id
  const fetchMobilePatients = useCallback(async (mobileId: number) => {
    setLoadingMobilePatients(true);
    try {
      const response = await fetch(`/api/mobile_dentals/${mobileId}/patients?page=1&limit=100`, {
        headers: withAuthHeaders()
      });
      const result = await response.json();
      setMobilePatients(result.data || []);
    } catch (err) {
      console.error("Fetch mobile patients error:", err);
      setMobilePatients([]);
    } finally {
      setLoadingMobilePatients(false);
    }
  }, []);

  // ฟังก์ชันดึงข้อมูลรายละเอียดรายคน (ใช้ตอนกด Detail)
  const getPatientDetail = async (id: number) => {
    try {
      const response = await fetch(`/api/patients/${id}`, {
        headers: withAuthHeaders()  // ✅ เพิ่ม header สำหรับ auth
      });
      const result = await response.json();
      return result.data; // คืนค่าข้อมูลเต็ม
    } catch (err) {
      console.error("Fetch Detail error:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchMobileDentals();
  }, [fetchPatients, fetchMobileDentals]);

  return {
    patients,
    loading,
    getPatientDetail,
    mobileDentals,
    fetchMobilePatients,
    mobilePatients,
    loadingMobilePatients
  };
};
