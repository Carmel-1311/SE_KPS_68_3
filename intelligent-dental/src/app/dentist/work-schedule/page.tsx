"use client";

import React, { useState, useEffect } from "react";
import { 
  Card, Typography, Spin, Tag, Modal, Descriptions, Badge, Button, Space, Divider, Form, Select, TimePicker, Input
} from "antd";
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  PhoneOutlined, 
  MedicineBoxOutlined,
  SolutionOutlined,
  CoffeeOutlined,
  PlusOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

// --- Config ---
const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = 100;
const DAYS_MAP: Record<string, number> = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
const DAYS_TH = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const DAYS_EN_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DentistPersonalSchedule() {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [breakTimes, setBreakTimes] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // 1. ตั้งค่าเวลาพัก Default (12:00 - 13:00)
    const defaultBreaks = DAYS_EN_SHORT.map((day, index) => ({
      id: `default-break-${index}`,
      date: day,
      start_time: "12:00",
      end_time: "13:00",
      type: "break",
      note: "พักกลางวัน"
    }));
    setBreakTimes(defaultBreaks);

    // 2. ข้อมูลนัดหมายคนไข้ (แสดงผลตามชุดโค้ดที่คุณต้องการ)
    const mockData = [
      { id: "1", date: "Mon", start_time: "09:00", end_time: "09:30", patient: "คุณวิภาดา สวยงาม", service: "ขูดหินปูน + ฟอกสีฟัน", phone: "081-123-4567", status: "confirmed" },
      { id: "2", date: "Mon", start_time: "13:00", end_time: "13:30", patient: "คุณสมชาย ใจดี", service: "อุดฟัน 2 ซี่", phone: "089-987-6543", status: "confirmed" },
      { id: "3", date: "Wed", start_time: "10:00", end_time: "10:30", patient: "คุณมานะ อดทน", service: "ผ่าฟันคุด (Impacted Tooth)", phone: "062-444-5555", status: "confirmed" },
      { id: "4", date: "Fri", start_time: "15:00", end_time: "15:30", patient: "เด็กชายก้อง", service: "เคลือบหลุมร่องฟัน", phone: "085-000-1111", status: "pending" },
    ];
    
    setTimeout(() => { 
      setSchedules(mockData); 
      setLoading(false); 
    }, 500);
  }, []);

  const calculatePos = (start: string, end: string) => {
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);
    return {
      top: ((sH - START_HOUR) * HOUR_HEIGHT) + (sM * HOUR_HEIGHT / 60),
      height: ((eH * 60 + eM) - (sH * 60 + sM)) * HOUR_HEIGHT / 60
    };
  };

  const handleAddBreak = (values: any) => {
    const newBreak = {
      id: Date.now().toString(),
      date: values.date,
      start_time: values.timeRange[0].format("HH:mm"),
      end_time: values.timeRange[1].format("HH:mm"),
      type: "break",
      note: values.note || "พักเบรก"
    };
    setBreakTimes([...breakTimes, newBreak]);
    setIsBreakModalOpen(false);
    form.resetFields();
  };

  return (
    <Card 
      bordered={false} 
      style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8f9fa' }}
      bodyStyle={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid #d9d9d9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size="middle">
          <div style={{ background: '#1890ff', padding: '10px', borderRadius: '8px' }}>
            <CalendarOutlined style={{ color: '#fff', fontSize: '20px' }} />
          </div>
          <div>
            <Title level={3} style={{ margin: 0 }}>ตารางการทำงานของฉัน</Title>
            <Text type="secondary">ทพ. สมชาย ใจดี (Dentist General)</Text>
          </div>
        </Space>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsBreakModalOpen(true)}
          style={{ borderRadius: '6px' }}
        >
          เพิ่มเวลาพัก
        </Button>
      </div>

      {loading ? <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div> : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
          
          {/* Day Headers */}
          <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 20, background: "#fff", borderBottom: "2px solid #1890ff" }}>
            <div style={{ width: 80, flexShrink: 0, borderRight: "1px solid #f0f0f0" }} />
            {DAYS_TH.map((day, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", padding: "15px 0", fontWeight: "bold", fontSize: '15px', color: i === new Date().getDay() ? '#1890ff' : '#555' }}>
                {day} {i === new Date().getDay() && <Badge status="processing" />}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", position: "relative", minWidth: "1200px" }}>
            {/* Time Slots Labels */}
            <div style={{ width: 80, flexShrink: 0, background: "#fff", borderRight: "1px solid #f0f0f0" }}>
              {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                <div key={i} style={{ height: HOUR_HEIGHT, borderBottom: "1px solid #f0f0f0", display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '10px' }}>
                  <Text strong style={{ fontSize: '12px', color: '#999' }}>{`${(START_HOUR + i).toString().padStart(2, '0')}:00`}</Text>
                </div>
              ))}
            </div>

            {/* Grid Area */}
            <div style={{ flex: 1, position: "relative", display: "flex" }}>
              {/* Guidelines */}
              <div style={{ position: "absolute", width: '100%', height: '100%', pointerEvents: 'none' }}>
                {Array.from({ length: (END_HOUR - START_HOUR + 1) * 2 }).map((_, i) => (
                  <div key={i} style={{ height: HOUR_HEIGHT / 2, borderBottom: i % 2 === 0 ? "1px dashed #f5f5f5" : "1px solid #f0f0f0" }} />
                ))}
              </div>

              {DAYS_TH.map((_, dayIdx) => (
                <div key={dayIdx} style={{ flex: 1, position: "relative", borderRight: "1px solid #f0f0f0" }}>
                  
                  {/* แสดงเวลาพัก (Breaks) */}
                  {breakTimes.filter(b => DAYS_MAP[b.date] === dayIdx).map(item => {
                    const { top, height } = calculatePos(item.start_time, item.end_time);
                    return (
                      <div key={item.id} style={{
                        position: "absolute", top: `${top}px`, height: `${height}px`, width: "100%", left: 0,
                        background: '#f0f0f0', border: '1px solid #d9d9d9', zIndex: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundImage: 'linear-gradient(45deg, #e9e9e9 25%, transparent 25%, transparent 50%, #e9e9e9 50%, #e9e9e9 75%, transparent 75%, transparent)',
                        backgroundSize: '20px 20px', opacity: 0.8
                      }}>
                        <Text type="secondary" style={{ fontSize: '12px', fontWeight: 'bold' }}><CoffeeOutlined /> {item.note}</Text>
                      </div>
                    );
                  })}

                  {/* แสดงนัดหมายคนไข้ */}
                  {schedules.filter(s => DAYS_MAP[s.date] === dayIdx).map(item => {
                    const { top, height } = calculatePos(item.start_time, item.end_time);
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => { setSelectedCase(item); setIsModalOpen(true); }}
                        className="dentist-block"
                        style={{
                          position: "absolute", top: `${top}px`, height: `${height}px`, width: "94%", left: "3%",
                          background: item.status === 'confirmed' ? 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)' : '#fffbe6',
                          borderLeft: `5px solid ${item.status === 'confirmed' ? '#1890ff' : '#faad14'}`,
                          borderRadius: "8px", padding: "10px", zIndex: 5, cursor: "pointer", 
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column'
                        }}
                      >
                        <Text strong style={{ fontSize: '14px', color: '#003a8c' }}>{item.patient}</Text>
                        <Text style={{ fontSize: '12px', color: '#444' }} ellipsis><MedicineBoxOutlined /> {item.service}</Text>
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontSize: '11px', fontWeight: 'bold' }}><ClockCircleOutlined /> {item.start_time}</Text>
                          <Badge status={item.status === 'confirmed' ? "success" : "warning"} />
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

      {/* --- Details Modal (แบบที่คุณต้องการ) --- */}
      <Modal
        title={<Title level={4} style={{ margin: 0 }}><SolutionOutlined /> รายละเอียดเคสคนไข้</Title>}
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        width={550}
      >
        {selectedCase && (
          <div style={{ paddingTop: '10px' }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="ชื่อคนไข้"><b>{selectedCase.patient}</b></Descriptions.Item>
              <Descriptions.Item label="เบอร์ติดต่อ"><Text>{selectedCase.phone}</Text></Descriptions.Item>
              <Descriptions.Item label="เวลาตรวจ">
                <Tag color="blue">{selectedCase.start_time} - {selectedCase.end_time} น.</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="การรักษา">
                <Text strong style={{ color: '#1890ff' }}>{selectedCase.service}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="สถานะ">
                <Tag color={selectedCase.status === 'confirmed' ? 'green' : 'gold'}>
                  {selectedCase.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอการยืนยัน'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <Button type="primary" block onClick={() => setIsModalOpen(false)} style={{ marginTop: '20px', borderRadius: '6px' }}>
              รับทราบ
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal เพิ่มเวลาพัก */}
      <Modal
        title="เพิ่มเวลาหยุดพัก"
        open={isBreakModalOpen}
        onCancel={() => setIsBreakModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAddBreak} initialValues={{ timeRange: [dayjs('12:00', 'HH:mm'), dayjs('13:00', 'HH:mm')] }}>
          <Form.Item name="date" label="วันที่ต้องการพัก" rules={[{ required: true }]}>
            <Select placeholder="เลือกวัน">
              {DAYS_EN_SHORT.map((day, i) => (
                <Select.Option key={day} value={day}>{DAYS_TH[i]}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="timeRange" label="ช่วงเวลาที่พัก" rules={[{ required: true }]}>
            <TimePicker.RangePicker format="HH:mm" minuteStep={15} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="หมายเหตุ">
            <Input placeholder="ระบุเหตุผล เช่น พักกลางวัน หรือ ประชุม" />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        .dentist-block:hover { 
          transform: scale(1.02); 
          box-shadow: 0 6px 16px rgba(0,0,0,0.12);
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 4px; }
      `}</style>
    </Card>
  );
}