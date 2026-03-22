'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Input, Form, message, Space, Breadcrumb, Select } from 'antd';
import { SaveOutlined, HomeOutlined, CalendarOutlined, FileAddOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

// 🌟 Mock Database จำลองให้เหมือนโครงสร้าง API
const patientMockDB: Record<number, { first_name: string, last_name: string }> = {
  501: { first_name: 'สมชาย', last_name: 'ใจดี' },
  502: { first_name: 'สมหญิง', last_name: 'รักสวย' },
  503: { first_name: 'มานะ', last_name: 'อดทน' }
};

const dentistMockDB: Record<number, { first_name: string, last_name: string }> = {
  5: { first_name: 'สมเกียรติ', last_name: 'รักดี' },
  6: { first_name: 'นภา', last_name: 'แจ่มใส' }
};

export default function CreateAppointmentPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  
  // 🌟 State สำหรับจัดการเรื่องเวลาที่ว่าง (available-slots)
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const selectedDate = Form.useWatch('appointment_date', form);
  const selectedDentist = Form.useWatch('dentist_id', form); // 🌟 เปลี่ยนเป็น dentist_id ตาม API

  useEffect(() => {
    if (selectedDate && selectedDentist) {
      fetchAvailableSlots(selectedDate, selectedDentist);
    } else {
      setAvailableSlots([]);
      form.setFieldValue('appointment_time', undefined); 
    }
  }, [selectedDate, selectedDentist, form]);

  // 🌟 ดึงข้อมูลจาก api available-slots
  const fetchAvailableSlots = (date: string, dentistId: number) => {
    setLoadingSlots(true);
    setTimeout(() => {
      // เวลาทุกๆ 30 นาที
      const mockSlots = [
        '09:00:00', '09:30:00', '10:00:00', '10:30:00', 
        '11:00:00', '13:00:00', '13:30:00', '14:00:00', 
        '14:30:00', '15:00:00', '15:30:00', '16:00:00'
      ];
      
      // จำลองการกรองเวลาว่าง (หมอว่าง)
      const randomAvailable = mockSlots.filter(() => Math.random() > 0.3);
      
      setAvailableSlots(randomAvailable);
      setLoadingSlots(false);
    }, 500);
  };

  const handleCreate = async (values: any) => {
    setSaving(true);
    try {
      // 🌟 Payload เตรียมส่งให้ API
      const payload = {
        patient_id: Number(values.patient_id),
        dentist_id: Number(values.dentist_id), // ใช้ dentist_id
        appointment_date: values.appointment_date,
        appointment_time: values.appointment_time,
        type: values.type
      };

      setTimeout(() => {
        const storedData = localStorage.getItem('appointment_schedule');
        let appointments = storedData ? JSON.parse(storedData) : [];

        const patientInfo = patientMockDB[payload.patient_id] || { first_name: `ผู้ป่วยรหัส ${payload.patient_id}`, last_name: '' };
        const dentistInfo = dentistMockDB[payload.dentist_id] || { first_name: `แพทย์รหัส ${payload.dentist_id}`, last_name: '' };

        // 🌟 ปรับ Mock ข้อมูลที่บันทึกให้โครงสร้างตรงกับ GET /api/appointment_schedule
        const newAppointment = {
          appointment_id: appointments.length > 0 ? Math.max(...appointments.map((a:any) => a.appointment_id)) + 1 : 1001,
          appointment_date: payload.appointment_date,
          appointment_time: payload.appointment_time,
          type: payload.type,
          status: 'scheduled',
          patient: {
            patient_id: payload.patient_id,
            first_name: patientInfo.first_name,
            last_name: patientInfo.last_name,
            phone: 'ไม่ระบุ'
          },
          dentist: {
            dentist_id: payload.dentist_id,
            first_name: dentistInfo.first_name,
            last_name: dentistInfo.last_name
          }
        };

        appointments.push(newAppointment);
        localStorage.setItem('appointment_schedule', JSON.stringify(appointments)); // 🌟 บันทึกทับ key ที่ใช้หน้าแรก

        message.success('เพิ่มการนัดหมายเรียบร้อยแล้ว');
        router.push('/personnel/appointment-schedule'); // 🌟 แก้ URL ตอนกลับให้ถูกต้อง
      }, 800);
    } catch (error) {
      message.error('เพิ่มข้อมูลไม่สำเร็จ');
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      
      <Breadcrumb
        style={{ marginBottom: '24px', fontSize: '15px' }}
        items={[
          { title: <a onClick={() => router.push('/')}><HomeOutlined /> หน้าหลัก</a> },
          { title: <a onClick={() => router.push('/personnel/appointment-schedule')}><CalendarOutlined /> ตารางการนัดหมาย</a> }, // 🌟 แก้ URL
          { title: <span><FileAddOutlined /> เพิ่มการนัดหมาย</span> },
        ]}
      />

      <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Title level={3} style={{ marginBottom: '4px' }}>เพิ่มการนัดหมายใหม่</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>กรอกข้อมูลเพื่อสร้างคิวการนัดหมายใหม่เข้าระบบ</Text>

        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Form.Item name="patient_id" label="รหัสคนไข้ (Patient ID)" style={{ flex: 1, minWidth: '250px' }} rules={[{ required: true, message: 'ระบุรหัสคนไข้' }]}>
              <Input type="number" placeholder="เช่น 501, 502" size="large" />
            </Form.Item>
            
            <Form.Item name="dentist_id" label="ทันตแพทย์" style={{ flex: 1, minWidth: '250px' }} rules={[{ required: true, message: 'กรุณาเลือกแพทย์' }]}>
              <Select size="large" placeholder="เลือกทันตแพทย์">
                {Object.entries(dentistMockDB).map(([id, info]) => (
                  <Select.Option key={id} value={Number(id)}>{`ทพ./ทพญ. ${info.first_name} ${info.last_name}`}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Form.Item name="appointment_date" label="วันที่นัด" style={{ flex: 1, minWidth: '250px' }} rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}>
              <Input type="date" size="large" />
            </Form.Item>
            
            <Form.Item name="appointment_time" label="เวลา (แสดงเฉพาะช่วงที่แพทย์ว่าง)" style={{ flex: 1, minWidth: '250px' }} rules={[{ required: true, message: 'กรุณาระบุเวลา' }]}>
              <Select 
                size="large" 
                placeholder={(!selectedDate || !selectedDentist) ? "กรุณาเลือกวันและแพทย์ก่อน" : "เลือกเวลา"}
                disabled={!selectedDate || !selectedDentist}
                loading={loadingSlots}
              >
                {availableSlots.map((time) => (
                  <Select.Option key={time} value={time}>
                    {time.slice(0, 5)} น.
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="type" label="บริการ/การรักษา (Type)" rules={[{ required: true, message: 'ระบุประเภทการนัดหมาย' }]}>
            <Input.TextArea placeholder="เช่น ตรวจสุขภาพช่องปากและขูดหินปูน, อุดฟัน" rows={3} size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: '32px', marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button size="large" onClick={() => router.push('/personnel/appointment-schedule')}>ยกเลิก</Button> {/* 🌟 แก้ URL */}
              <Button type="primary" size="large" htmlType="submit" icon={<SaveOutlined />} loading={saving}>บันทึกข้อมูล</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}