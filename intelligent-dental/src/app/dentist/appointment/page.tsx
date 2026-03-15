"use client";

import React, { useState, useEffect } from "react";
import { Card, Typography, Spin, Tag, Modal, Descriptions, Badge, Skeleton } from "antd";
import { 
  ClockCircleOutlined, CalendarOutlined, MedicineBoxOutlined, 
  InfoCircleOutlined, UserOutlined 
} from "@ant-design/icons";
import dayjs from "dayjs"; // แนะนำให้ใช้ dayjs สำหรับจัดการวันที่
import "dayjs/locale/th";

dayjs.locale("th");

const { Title, Text } = Typography;

// --- Config ---
const START_HOUR = 8;
const END_HOUR = 19;
const HOUR_HEIGHT = 100;
const DAYS_TH = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

export default function AppointmentCalendarWithDates() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // ฟังก์ชันคำนวณวันที่ของแต่ละวันในสัปดาห์ปัจจุบัน (เริ่มที่อาทิตย์)
  const getDaysInWeek = () => {
    const startOfWeek = dayjs().startOf("week");
    return Array.from({ length: 7 }).map((_, i) => {
      const dateObj = startOfWeek.add(i, "day");
      return {
        dayName: DAYS_TH[i],
        dateNum: dateObj.date(),
        fullDate: dateObj.format("YYYY-MM-DD"),
        isToday: dateObj.isSame(dayjs(), "day"),
      };
    });
  };

  const weekDays = getDaysInWeek();

  useEffect(() => {
    // จำลองข้อมูลนัดหมาย (ในงานจริงให้ใช้ format YYYY-MM-DD ตรงกับ fullDate)
    const mockData = [
      {
        appointment_id: 101,
        patient: { name: "คุณวิภาดา สวยงาม" },
        appointment_date: dayjs().startOf("week").add(1, "day").format("YYYY-MM-DD"), // วันจันทร์ของสัปดาห์นี้
        appointment_time: "09:30:00",
        type: "ขูดหินปูน",
        status: "scheduled",
      },
      {
        appointment_id: 102,
        patient: { name: "คุณสมชาย ใจดี" },
        appointment_date: dayjs().format("YYYY-MM-DD"), // วันนี้
        appointment_time: "13:00:00",
        type: "อุดฟัน",
        status: "completed",
      }
    ];
    setAppointments(mockData);
    setLoading(false);
  }, []);

  return (
    <Card bodyStyle={{ padding: 0 }} bordered={false} style={{ borderRadius: '12px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={3} style={{ margin: 0 }}>
          <CalendarOutlined style={{ color: '#1890ff', marginRight: 10 }} /> 
          ตารางนัดหมายประจำสัปดาห์
        </Title>
        <Text type="secondary">{dayjs().startOf("week").format("D MMM")} - {dayjs().endOf("week").format("D MMM YYYY")}</Text>
      </div>

      {loading ? <div style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Day Headers พร้อมวันที่ */}
          <div style={{ display: 'flex', background: '#fff', borderBottom: '2px solid #1890ff' }}>
            <div style={{ width: 80, flexShrink: 0, borderRight: '1px solid #f0f0f0' }} />
            {weekDays.map((day, i) => (
              <div key={i} style={{ 
                flex: 1, 
                textAlign: 'center', 
                padding: '12px 0', 
                background: day.isToday ? '#e6f7ff' : 'transparent',
                borderLeft: i > 0 ? '1px solid #f0f0f0' : 'none',
                transition: 'all 0.3s'
              }}>
                <div style={{ fontSize: '12px', color: day.isToday ? '#1890ff' : '#8c8c8c', fontWeight: 500 }}>{day.dayName}</div>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: day.isToday ? '#1890ff' : '#262626',
                  marginTop: '2px'
                }}>
                  {day.dateNum}
                </div>
                {day.isToday && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1890ff', margin: '4px auto 0' }} />}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', position: 'relative' }}>
            {/* Time Column */}
            <div style={{ width: 80, flexShrink: 0, background: '#fafafa', borderRight: '1px solid #f0f0f0' }}>
              {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                <div key={i} style={{ height: HOUR_HEIGHT, textAlign: 'center', paddingTop: 10 }}>
                  <Text strong style={{ fontSize: 12, color: '#bfbfbf' }}>{`${(START_HOUR + i).toString().padStart(2, '0')}:00`}</Text>
                </div>
              ))}
            </div>

            {/* Grid Area */}
            <div style={{ flex: 1, display: 'flex', position: 'relative', background: '#fff' }}>
              {/* Horizontal Lines */}
              <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
                {Array.from({ length: (END_HOUR - START_HOUR + 1) }).map((_, i) => (
                  <div key={i} style={{ height: HOUR_HEIGHT, borderBottom: '1px solid #f5f5f5' }} />
                ))}
              </div>

              {/* Appointment Blocks */}
              {weekDays.map((day, dayIdx) => (
                <div key={dayIdx} style={{ flex: 1, position: 'relative', borderRight: '1px solid #f0f0f0' }}>
                  {appointments
                    .filter(a => a.appointment_date === day.fullDate)
                    .map(item => {
                      const [h, m] = item.appointment_time.split(":").map(Number);
                      const top = ((h - START_HOUR) * HOUR_HEIGHT) + (m * HOUR_HEIGHT / 60);

                      return (
                        <div 
                          key={item.appointment_id}
                          onClick={() => setSelectedId(item.appointment_id)}
                          style={{
                            position: 'absolute', top, width: '92%', left: '4%', height: 85,
                            background: item.status === 'completed' ? '#f6ffed' : '#fff',
                            borderLeft: `4px solid ${item.status === 'completed' ? '#52c41a' : '#1890ff'}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            borderRadius: '4px', padding: '10px', zIndex: 5, cursor: 'pointer'
                          }}
                          className="apt-card"
                        >
                          <Text strong style={{ fontSize: '14px', display: 'block' }}>{item.patient.name}</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}><MedicineBoxOutlined /> {item.type}</Text>
                          <div style={{ marginTop: '5px' }}>
                            <Tag color={item.status === 'completed' ? 'green' : 'blue'} style={{ fontSize: '10px' }}>
                              {item.appointment_time.substring(0, 5)} น.
                            </Tag>
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
        .apt-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.2s; }
      `}</style>
    </Card>
  );
}