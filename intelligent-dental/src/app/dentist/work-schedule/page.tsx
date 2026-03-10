"use client";

import React, { useState, useEffect } from "react";
import { Card, Typography, Spin, Tag, Space } from "antd";
import { ClockCircleOutlined, UserOutlined, MedicineBoxOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

// --- 1. Settings & Data Interface ---
const START_HOUR = 8;
const END_HOUR = 19; // ขยายถึง 19:00 เพื่อความครอบคลุม
const DAYS_TH = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

interface Appointment {
  id: string;
  dayIndex: number; 
  startTime: string; 
  endTime: string;   
  patientName: string;
  service: string;
  status: "waiting" | "in-progress" | "completed";
}

export default function WorkScheduleDashboard() {
  const [loading, setLoading] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      // ข้อมูลจำลอง
      const mockData: Appointment[] = [
        { id: "1", dayIndex: 1, startTime: "08:30", endTime: "10:30", patientName: "คุณสมชาย ใจดี", service: "ตรวจฟัน/อุดฟัน", status: "completed" },
        { id: "2", dayIndex: 2, startTime: "13:00", endTime: "14:30", patientName: "คุณวิภาดา สวยงาม", service: "ขูดหินปูน", status: "in-progress" },
        { id: "3", dayIndex: 4, startTime: "10:00", endTime: "12:00", patientName: "คุณมานะ อดทน", service: "ผ่าฟันคุด", status: "waiting" },
        { id: "4", dayIndex: 5, startTime: "15:00", endTime: "17:30", patientName: "คุณจอนนี่", service: "จัดฟันรายเดือน", status: "waiting" },
      ];
      setTimeout(() => { setAppointments(mockData); setLoading(false); }, 600);
    };
    fetchAppointments();
  }, []);

  // --- 2. Helper Functions ---
  const getStatusConfig = (status: string) => {
    const config = {
      completed: { color: "#52c41a", bg: "#f6ffed", label: "เสร็จสิ้น" },
      "in-progress": { color: "#1890ff", bg: "#e6f7ff", label: "กำลังรักษา" },
      waiting: { color: "#faad14", bg: "#fff7e6", label: "รอพบแพทย์" },
    };
    return config[status as keyof typeof config];
  };

  return (
    <Card 
      bordered={true} 
      style={{ borderRadius: 0, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* Header ของ Card */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={4} style={{ margin: 0 }}>
          <MedicineBoxOutlined /> ตารางนัดหมายทันตแพทย์รายสัปดาห์
        </Title>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
          
          {/* แถวชื่อวัน (Sticky Header) */}
          <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 10, backgroundColor: "#fafafa", borderBottom: "2px solid #f0f0f0" }}>
            <div style={{ width: 80, flexShrink: 0, borderRight: "1px solid #f0f0f0" }} />
            {DAYS_TH.map((day, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", padding: "15px 0", fontWeight: "800", fontSize: "15px", borderRight: i < 6 ? "1px solid #f0f0f0" : "none" }}>
                {day}
              </div>
            ))}
          </div>

          {/* พื้นที่ตารางเวลา */}
          <div style={{ display: "flex", position: "relative", minHeight: "800px" }}>
            
            {/* Column บอกเวลาด้านซ้าย */}
            <div style={{ width: 80, flexShrink: 0, borderRight: "1px solid #f0f0f0", backgroundColor: "#fff" }}>
              {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                <div key={i} style={{ height: 80, borderBottom: "1px solid #f0f0f0", textAlign: "center", paddingTop: "5px", fontSize: "13px", color: "#999", fontWeight: "bold" }}>
                  {`${(START_HOUR + i).toString().padStart(2, '0')}:00`}
                </div>
              ))}
            </div>

            {/* Grid เส้นพื้นหลัง */}
            <div style={{ position: "absolute", top: 0, left: 80, right: 0, bottom: 0, pointerEvents: 'none' }}>
              {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                <div key={i} style={{ height: 80, borderBottom: "1px solid #f5f5f5" }} />
              ))}
            </div>

            {/* Column ข้อมูลของแต่ละวัน */}
            {DAYS_TH.map((_, dayIdx) => (
              <div key={dayIdx} style={{ flex: 1, position: "relative", borderRight: dayIdx < 6 ? "1px solid #f0f0f0" : "none" }}>
                {appointments.filter(app => app.dayIndex === dayIdx).map(app => {
                  const [sH, sM] = app.startTime.split(":").map(Number);
                  const [eH, eM] = app.endTime.split(":").map(Number);
                  const top = ((sH - START_HOUR) * 80) + (sM * 80 / 60);
                  const height = ((eH * 60 + eM) - (sH * 60 + sM)) * 80 / 60;
                  const config = getStatusConfig(app.status);

                  return (
                    <div key={app.id} style={{
                      position: "absolute",
                      top: `${top}px`,
                      height: `${height}px`,
                      width: "94%",
                      left: "3%",
                      backgroundColor: config.bg,
                      borderLeft: `5px solid ${config.color}`,
                      border: `1px solid ${config.color}66`,
                      borderRadius: "4px",
                      padding: "8px",
                      zIndex: 2,
                      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      transition: "all 0.2s"
                    }}>
                      <div style={{ fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                        <ClockCircleOutlined /> <b>{app.startTime} - {app.endTime}</b>
                      </div>
                      <div style={{ fontWeight: "800", fontSize: "14px", color: "#222", marginBottom: "4px", lineHeight: "1.2" }}>
                         {app.patientName}
                      </div>
                      <div style={{ fontSize: "13px", color: "#444", flexGrow: 1 }}>
                        {app.service}
                      </div>
                      <Tag color={app.status === 'completed' ? 'green' : app.status === 'in-progress' ? 'blue' : 'orange'} 
                           style={{ alignSelf: 'flex-start', margin: 0, borderRadius: '2px', fontWeight: 'bold', fontSize: '11px' }}>
                        {config.label}
                      </Tag>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <style jsx global>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #bbb; }
        .ant-card-body { overflow: hidden; }
      `}</style>
    </Card>
  );
}