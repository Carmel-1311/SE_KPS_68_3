import { useState, useEffect, useCallback } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";

export const useDentist = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ดึงรายชื่อทั้งหมด (มีแค่ id, name, email)
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/patients", {
        headers: withAuthHeaders()  // ✅ เพิ่ม header สำหรับ auth
      });
      const result = await response.json();
      // อ้างอิงตาม Spec: result.data = [{id, name, email}]
      console.log("Data from API:", result.data); // เพิ่มบรรทัดนี้เพื่อเช็คจำนวน object ใน array
      setPatients(result.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
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
  }, [fetchPatients]);

  return { patients, loading, getPatientDetail };
};
