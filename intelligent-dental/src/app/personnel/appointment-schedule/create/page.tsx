'use client';

import React, { useState } from 'react';
import { Card, Typography, Button, Input, Form, message, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

// 🌟 Mock Database จำลองสำหรับดึงชื่อจาก ID
const patientMockDB: Record<number, string> = {
  101: 'สมชาย ใจดี',
  102: 'สมหญิง รักสวย'
};

const getPatientName = (id: number) => patientMockDB[id] || `คนไข้รหัส ${id}`;

export default function CreateAppointmentPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleCreate = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        patient_id: Number(values.patient_id),
        appointment_date: values.appointment_date,
        appointment_time: values.appointment_time,
        type: values.type
      };

      setTimeout(() => {
        const storedData = localStorage.getItem('appointments');
        let appointments = storedData ? JSON.parse(storedData) : [];

        // 🌟 จำลอง Mock Response ที่ได้กลับมาจาก API พร้อมชื่อที่ถูกต้อง
        const mockResponse = {
          data: {
            appointment_id: appointments.length > 0 ? Math.max(...appointments.map((a:any) => a.id)) + 1 : 1,
            patient: {
              id: payload.patient_id,
              name: getPatientName(payload.patient_id) // ดึงชื่อจาก Mock DB
            },
            staff: {
              id: 0, // ยังไม่มีการเลือกหมอในขั้นตอนนี้
              name: "รอการระบุแพทย์" 
            },
            appointment_date: payload.appointment_date,
            appointment_time: payload.appointment_time,
            type: payload.type,
            status: "scheduled", 
            medical_record: null, 
            inspection_record: null 
          }
        };

        const responseData = mockResponse.data;
        
        appointments.push({
          ...responseData,
          id: responseData.appointment_id,
          patient_name: responseData.patient.name,
          staff_name: responseData.staff.name,
          treatment: responseData.type
        });
        
        localStorage.setItem('appointments', JSON.stringify(appointments));

        message.success('เพิ่มการนัดหมายเรียบร้อยแล้ว');
        router.push('/personnel/appointment-schedule');
      }, 800);
    } catch (error) {
      message.error('เพิ่มข้อมูลไม่สำเร็จ');
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => router.push('/personnel/appointment-schedule')} style={{ marginBottom: '16px', padding: 0 }}>
        กลับไปหน้าตาราง
      </Button>

      <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Title level={3} style={{ marginBottom: '4px' }}>เพิ่มการนัดหมายใหม่</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>กรอกข้อมูลเพื่อสร้างคิวการนัดหมายใหม่เข้าระบบ</Text>

        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="patient_id" label="รหัสคนไข้ (Patient ID)" rules={[{ required: true, message: 'ระบุรหัสคนไข้' }]}>
            <Input type="number" placeholder="เช่น 101, 102" size="large" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item name="appointment_date" label="วันที่นัด" style={{ flex: 1 }} rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}>
              <Input type="date" size="large" />
            </Form.Item>
            <Form.Item name="appointment_time" label="เวลา" style={{ flex: 1 }} rules={[{ required: true, message: 'กรุณาระบุเวลา' }]}>
              <Input type="time" size="large" />
            </Form.Item>
          </div>

          <Form.Item name="type" label="ประเภท/เรื่องที่นัด (Type)" rules={[{ required: true, message: 'ระบุประเภทการนัดหมาย' }]}>
            <Input.TextArea placeholder="เช่น ขูดหินปูน, ปรึกษาจัดฟัน" rows={3} size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: '32px', marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button size="large" onClick={() => router.push('/personnel/appointment-schedule')}>ยกเลิก</Button>
              <Button type="primary" size="large" htmlType="submit" icon={<SaveOutlined />} loading={saving}>บันทึกข้อมูล</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}