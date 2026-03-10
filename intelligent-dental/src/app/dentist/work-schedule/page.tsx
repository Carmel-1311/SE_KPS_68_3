"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, Card, Typography, Spin, 
  Row, Col, List, Tag, Space, Button 
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  CalendarOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";

dayjs.locale("th");
const { Title, Text } = Typography;

// --- 1. Interface ข้อมูลนัดหมาย ---
interface Appointment {
  id: string;
  date: string; // รูปแบบ "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  patientName: string;
  service: string;
  status: "success" | "warning" | "error" | "processing";
  note?: string;
}

export default function WorkScheduleDashboard() {
  const [loading, setLoading] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  // --- 2. ดึงข้อมูลจาก Database (จำลอง) ---
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        // ตัวอย่างข้อมูลนัดหมายในระบบ
        const mockData: Appointment[] = [
          { id: "1", date: dayjs().format("YYYY-MM-DD"), startTime: "09:00", endTime: "10:00", patientName: "คุณสมชาย ใจดี", service: "อุดฟัน", status: "success", note: "ฟันกรามบนซ้าย" },
          { id: "2", date: dayjs().format("YYYY-MM-DD"), startTime: "10:30", endTime: "11:30", patientName: "คุณวิภาดา", service: "ขูดหินปูน", status: "processing" },
          { id: "3", date: dayjs().add(2, 'day').format("YYYY-MM-DD"), startTime: "13:00", endTime: "14:00", patientName: "คุณมานะ", service: "ถอนฟัน", status: "warning" },
          { id: "4", date: dayjs().add(5, 'day').format("YYYY-MM-DD"), startTime: "09:00", endTime: "10:00", patientName: "คุณจอนนี่", service: "ตรวจฟัน", status: "processing" },
        ];
        
        setTimeout(() => {
          setAppointments(mockData);
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // --- 3. ฟังก์ชันสำหรับ Highlight วันที่มีนัดหมาย (สีแดง) ---
  const fullCellRender = (date: Dayjs) => {
    const dateString = date.format("YYYY-MM-DD");
    // ตรวจสอบว่าวันนี้มีนัดหมายหรือไม่
    const hasAppointment = appointments.some(app => app.date === dateString);
    const isSelected = date.isSame(selectedDate, 'day');

    return (
      <div 
        className={`ant-picker-cell-inner ant-picker-calendar-date ${hasAppointment ? 'has-event-bg' : ''} ${isSelected ? 'ant-picker-calendar-date-selected' : ''}`}
        style={{ 
          position: 'relative',
          border: hasAppointment ? '1px solid #ff4d4f' : 'none', // ขอบแดงถ้ามีงาน
          backgroundColor: hasAppointment ? '#fff1f0' : 'transparent', // พื้นหลังแดงอ่อนถ้ามีงาน
          borderRadius: 0
        }}
      >
        <div className="ant-picker-calendar-date-value">{date.date()}</div>
        {hasAppointment && (
          <div style={{ 
            position: 'absolute', 
            bottom: 2, 
            left: '50%', 
            transform: 'translateX(-50%)',
            width: 4, 
            height: 4, 
            backgroundColor: '#ff4d4f', 
            borderRadius: '50%' 
          }} />
        )}
      </div>
    );
  };

  // กรองข้อมูลเฉพาะวันที่เลือกมาแสดงฝั่งขวา
  const dailyData = appointments.filter(
    (item) => item.date === selectedDate.format("YYYY-MM-DD")
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        
        {/* --- ฝั่งซ้าย: ปฏิทิน Highlight วันที่มีนัด --- */}
        <Col xs={24} lg={9}>
          <Card bordered={true} style={{ borderRadius: 0 }}>
            <Title level={4}><CalendarOutlined /> ปฏิทินงาน</Title>
            <div className="mini-calendar-container">
              <Calendar 
                fullscreen={false} 
                onSelect={(date) => setSelectedDate(date)} 
                value={selectedDate}
                fullCellRender={fullCellRender} // ใช้ฟังก์ชัน Highlight
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <Space>
                <div style={{ width: 12, height: 12, backgroundColor: '#fff1f0', border: '1px solid #ff4d4f' }}></div>
                <Text type="secondary" style={{ fontSize: '12px' }}>วันที่มีนัดหมายทำงาน</Text>
              </Space>
            </div>
          </Card>
        </Col>

        {/* --- ฝั่งขวา: รายละเอียดนัดหมาย (Work Schedule) --- */}
        <Col xs={24} lg={15}>
          <Card 
            bordered={true} 
            style={{ borderRadius: 0, minHeight: '550px' }}
            title={
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}>
                  รายการวันที่: {selectedDate.format("D MMMM YYYY")}
                </Title>
              </Space>
            }
          >
            {loading ? (
              <div style={{ textAlign: "center", padding: "100px" }}><Spin tip="กำลังดึงข้อมูล..." /></div>
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={dailyData}
                locale={{ emptyText: <div style={{ padding: 40 }}><InfoCircleOutlined /> ไม่มีนัดหมายสำหรับวันนี้</div> }}
                renderItem={(item) => (
                  <List.Item style={{ padding: "0 0 12px 0", borderBottom: "none" }}>
                    <Card 
                      size="small" 
                      style={{ 
                        width: '100%',
                        borderRadius: 0, 
                        borderLeft: `5px solid ${item.status === 'success' ? '#52c41a' : '#1890ff'}`,
                      }}
                    >
                      <Row align="middle">
                        <Col span={5} style={{ borderRight: "1px solid #f0f0f0", textAlign: "center" }}>
                          <Text strong style={{ fontSize: "15px" }}>{item.startTime}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: "11px" }}>ถึง {item.endTime}</Text>
                        </Col>
                        <Col span={13} style={{ paddingLeft: "15px" }}>
                          <Text strong><UserOutlined /> {item.patientName}</Text>
                          <div style={{ fontSize: "13px", color: "#666" }}>{item.service}</div>
                        </Col>
                        <Col span={6} style={{ textAlign: "right" }}>
                          <Tag color={item.status === 'success' ? 'green' : 'blue'} style={{ borderRadius: 0 }}>
                            {item.status === 'success' ? 'เสร็จสิ้น' : 'รอนัดหมาย'}
                          </Tag>
                        </Col>
                      </Row>
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

      </Row>

      <style jsx global>{`
        /* ปรับแต่งปฏิทินให้ดูเหลี่ยมและสะอาด */
        .mini-calendar-container .ant-picker-calendar-header { padding: 10px 0 !important; }
        .ant-picker-calendar-date { margin: 0 !important; padding: 0 !important; height: 40px !important; line-height: 40px !important; }
        .ant-picker-cell-inner { border-radius: 0 !important; width: 100% !important; }
        
        /* Highlight สีแดงสำหรับวันที่มีนัดหมาย */
        .has-event-bg {
          color: #ff4d4f !important;
          font-weight: bold;
        }
        .ant-picker-calendar-date-selected {
          background-color: #1890ff !important;
          color: white !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}