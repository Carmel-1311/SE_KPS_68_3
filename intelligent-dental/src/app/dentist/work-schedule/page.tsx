"use client";

import React, { useState, useEffect } from "react";
import { Card, Typography, Spin, Tag } from "antd";
import { ClockCircleOutlined, UserOutlined, MedicineBoxOutlined } from "@ant-design/icons";

const { Title } = Typography;

// --- Settings ---
const START_HOUR = 8;
const END_HOUR = 19;
const DAYS_TH = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const HOUR_HEIGHT = 90; // เพิ่มความสูงต่อชั่วโมงอีกนิดให้อ่านง่าย

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

  return (
    <Card 
      bordered={true} 
      style={{ borderRadius: 0, height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <div style={{ padding: '12px 20px', borderBottom: '2px solid #e8e8e8', backgroundColor: '#fff' }}>
        <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
          <MedicineBoxOutlined /> ตารางนัดหมายทันตแพทย์รายสัปดาห์
        </Title>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
          
          {/* Header Row (Days) */}
          <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 20, backgroundColor: "#f0f2f5", borderBottom: "2px solid #bfbfbf" }}>
            <div style={{ width: 70, flexShrink: 0, borderRight: "2px solid #bfbfbf" }} />
            {DAYS_TH.map((day, i) => (
              <div key={i} style={{ 
                flex: 1, textAlign: "center", padding: "12px 0", fontWeight: "800", fontSize: "14px", 
                borderRight: i < 6 ? "1px solid #d9d9d9" : "none", color: '#434343' 
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div style={{ display: "flex", position: "relative", minWidth: "100%" }}>
            
            {/* Time Column (Left) */}
            <div style={{ width: 70, flexShrink: 0, borderRight: "2px solid #bfbfbf", backgroundColor: "#f9f9f9" }}>
              {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                <div key={i} style={{ 
                  height: HOUR_HEIGHT, borderBottom: "1px solid #d9d9d9", position: "relative"
                }}>
                  <span style={{ 
                    position: 'absolute', top: -10, width: '100%', textAlign: 'center', 
                    fontSize: '11px', fontWeight: 'bold', color: '#595959' 
                  }}>
                    {`${(START_HOUR + i).toString().padStart(2, '0')}:00`}
                  </span>
                </div>
              ))}
            </div>

            {/* Main Grid Area */}
            <div style={{ flex: 1, position: "relative", display: "flex" }}>
              
              {/* Background Grid Lines (เส้นแนวนอน) */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                {Array.from({ length: (END_HOUR - START_HOUR + 1) * 2 }).map((_, i) => (
                  <div key={i} style={{ 
                    height: HOUR_HEIGHT / 2, 
                    borderBottom: i % 2 === 0 ? "1px dashed #f0f0f0" : "1px solid #e8e8e8", // เส้นประทุกครึ่งชม. เส้นทึบทุกชม.
                    zIndex: 1
                  }} />
                ))}
              </div>

              {/* Columns for each day */}
              {DAYS_TH.map((_, dayIdx) => (
                <div key={dayIdx} style={{ 
                  flex: 1, position: "relative", borderRight: "1px solid #e8e8e8", zIndex: 2 
                }}>
                  {appointments.filter(app => app.dayIndex === dayIdx).map(app => {
                    const [sH, sM] = app.startTime.split(":").map(Number);
                    const [eH, eM] = app.endTime.split(":").map(Number);
                    const top = ((sH - START_HOUR) * HOUR_HEIGHT) + (sM * HOUR_HEIGHT / 60);
                    const height = ((eH * 60 + eM) - (sH * 60 + sM)) * HOUR_HEIGHT / 60;
                    
                    const statusColors = {
                      completed: { bar: "#52c41a", bg: "#f6ffed", text: "#237804" },
                      "in-progress": { bar: "#1890ff", bg: "#e6f7ff", text: "#0050b3" },
                      waiting: { bar: "#faad14", bg: "#fff7e6", text: "#874d00" },
                    }[app.status];

                    return (
                      <div key={app.id} style={{
                        position: "absolute", top: `${top}px`, height: `${height}px`,
                        width: "90%", left: "5%",
                        backgroundColor: statusColors.bg,
                        borderLeft: `4px solid ${statusColors.bar}`,
                        border: `1px solid ${statusColors.bar}88`,
                        borderRadius: "2px", padding: "6px",
                        boxShadow: "2px 2px 5px rgba(0,0,0,0.05)",
                        zIndex: 5, overflow: "hidden"
                      }}>
                        <div style={{ fontSize: "11px", color: statusColors.text, fontWeight: "bold", marginBottom: '2px' }}>
                          <ClockCircleOutlined /> {app.startTime} - {app.endTime}
                        </div>
                        <div style={{ fontWeight: "800", fontSize: "13px", color: "#000", lineHeight: 1.2 }}>
                          {app.patientName}
                        </div>
                        <div style={{ fontSize: "12px", color: "#434343", marginTop: '2px' }}>
                          {app.service}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #bfbfbf; border-radius: 5px; border: 2px solid #f1f1f1; }
        ::-webkit-scrollbar-thumb:hover { background: #999; }
      `}</style>
    </Card>
  );
}