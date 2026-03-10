"use client";

import React, { useState, useEffect } from "react";
import { Card, Typography, Spin, Tag, Space, Button } from "antd";
import { LeftOutlined, RightOutlined, ClockCircleOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");
const { Title, Text } = Typography;

// --- 1. Interface ข้อมูลนัดหมาย ---
interface Appointment {
  id: string;
  date: string;       // ต้องเป็นวันที่จริงๆ เช่น "2026-03-10"
  startTime: string;  // "09:00"
  endTime: string;    // "10:30"
  patientName: string;
  service: string;
  status: "waiting" | "in-progress" | "completed";
}

const START_HOUR = 8;
const END_HOUR = 18;
const PIXELS_PER_MINUTE = 1.5; 

export default function WeeklyTimetablePage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(dayjs().startOf("week"));

  const weekDays = Array.from({ length: 7 }).map((_, i) => currentWeekStart.add(i, "day"));
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => START_HOUR + i);

  // --- 2. ดึงข้อมูลจาก Database ---
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      // สมมติว่านี่คือข้อมูลจาก Database จริงๆ ที่มีวันที่ระบุชัดเจน
      const mockDatabase: Appointment[] = [
        { id: "1", date: "2026-03-10", startTime: "09:00", endTime: "10:30", patientName: "คุณสมชาย", service: "อุดฟัน", status: "completed" },
        { id: "2", date: "2026-03-10", startTime: "11:00", endTime: "12:00", patientName: "คุณวิภาดา", service: "ขูดหินปูน", status: "completed" },
        { id: "3", date: "2026-03-11", startTime: "13:00", endTime: "14:15", patientName: "คุณมานะ", service: "ผ่าฟันคุด", status: "in-progress" },
        // วันที่อื่นๆ ที่ไม่ได้อยู่ในสัปดาห์นี้จะไม่ถูกแสดง
        { id: "4", date: "2026-04-01", startTime: "10:00", endTime: "11:00", patientName: "คุณไพโรจน์", service: "ตรวจฟัน", status: "waiting" },
      ];
      
      setTimeout(() => {
        setAppointments(mockDatabase);
        setLoading(false);
      }, 500);
    };
    fetchAppointments();
  }, []);

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const calculateStyle = (startTime: string, endTime: string) => {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    const baseMin = START_HOUR * 60;
    return {
      top: `${(startMin - baseMin) * PIXELS_PER_MINUTE}px`,
      height: `${(endMin - startMin) * PIXELS_PER_MINUTE}px`,
      position: "absolute" as const,
      width: "95%",
      left: "2.5%",
      zIndex: 10,
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return { border: "#b7eb8f", bg: "#f6ffed", tag: "green", text: "เสร็จสิ้น" };
      case "in-progress": return { border: "#91caff", bg: "#e6f7ff", tag: "blue", text: "กำลังทำ" };
      default: return { border: "#ffd591", bg: "#fff7e6", tag: "orange", text: "รอนัด" };
    }
  };

  return (
    <div style={{ width: "100%", padding: "10px" }}>
      <Card bordered={true} style={{ borderRadius: 0 }}>
        
        {/* Navigation สำหรับเปลี่ยนสัปดาห์ */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Space direction="vertical" size={0}>
            <Title level={4} style={{ margin: 0 }}>ตารางงานรายสัปดาห์</Title>
            <Text type="secondary">{currentWeekStart.format("MMMM YYYY")}</Text>
          </Space>
          <Space>
            <Button icon={<LeftOutlined />} onClick={() => setCurrentWeekStart(currentWeekStart.subtract(1, "week"))} />
            <Button onClick={() => setCurrentWeekStart(dayjs().startOf("week"))}>วันนี้</Button>
            <Button icon={<RightOutlined />} onClick={() => setCurrentWeekStart(currentWeekStart.add(1, "week"))} />
          </Space>
        </div>

        <div style={{ border: "1px solid #f0f0f0", position: "relative", overflowX: "auto" }}>
          <div style={{ display: "flex", backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0", minWidth: "800px" }}>
            <div style={{ width: "60px", borderRight: "1px solid #f0f0f0" }} />
            {weekDays.map((day, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", padding: "10px", borderRight: i < 6 ? "1px solid #f0f0f0" : "none" }}>
                <div style={{ fontWeight: "bold" }}>{day.format("ddd")}</div>
                <div style={{ fontSize: "12px", color: day.isSame(dayjs(), 'day') ? "#1890ff" : "#888" }}>{day.format("D MMM")}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", position: "relative", height: `${(END_HOUR - START_HOUR + 1) * 60 * PIXELS_PER_MINUTE}px`, minWidth: "800px" }}>
            {/* เส้นเวลาด้านซ้าย */}
            <div style={{ width: "60px", borderRight: "1px solid #f0f0f0", position: "relative" }}>
              {hours.map((h, i) => (
                <div key={i} style={{ position: "absolute", top: `${i * 60 * PIXELS_PER_MINUTE}px`, width: "100%", textAlign: "center", fontSize: "11px", color: "#999", transform: "translateY(-50%)" }}>
                  {h}:00
                </div>
              ))}
            </div>

            {/* ช่องตาราง 7 วัน */}
            {weekDays.map((day, dayIdx) => {
              const dateStr = day.format("YYYY-MM-DD");
              // กรองเฉพาะนัดหมายที่ "วันที่ตรงกับคอลัมน์นี้เป๊ะๆ"
              const dayApps = appointments.filter(a => a.date === dateStr);

              return (
                <div key={dayIdx} style={{ flex: 1, position: "relative", borderRight: dayIdx < 6 ? "1px solid #f0f0f0" : "none" }}>
                  {/* เส้น Grid แนวนอน */}
                  {hours.map((_, i) => (
                    <div key={i} style={{ position: "absolute", top: `${i * 60 * PIXELS_PER_MINUTE}px`, width: "100%", borderTop: "1px solid #f5f5f5" }} />
                  ))}

                  {/* แสดงกล่องนัดหมาย */}
                  {dayApps.map(app => {
                    const status = getStatusColor(app.status);
                    return (
                      <div key={app.id} style={{ ...calculateStyle(app.startTime, app.endTime), backgroundColor: status.bg, border: `1px solid ${status.border}`, borderLeftWidth: "4px", padding: "4px", borderRadius: "2px", fontSize: "12px", overflow: "hidden" }}>
                        <Text strong style={{ fontSize: "11px", display: "block" }}>{app.startTime}-{app.endTime}</Text>
                        <Text strong>{app.patientName}</Text>
                        <div style={{ fontSize: "10px", color: "#666" }}>{app.service}</div>
                        <Tag color={status.tag} style={{ fontSize: "9px", padding: "0 2px", lineHeight: "14px", marginTop: "2px" }}>{status.text}</Tag>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}