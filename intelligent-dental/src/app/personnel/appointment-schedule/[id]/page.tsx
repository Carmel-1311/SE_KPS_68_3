'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, Typography, Button, Input, Form, Select, message, Spin, Space, Popconfirm } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import type { FormInstance } from 'antd';

const { Title, Text } = Typography;

// 🌟 Mock Database จำลองสำหรับดึงชื่อจาก ID
const patientMockDB: Record<number, string> = {
  101: 'สมชาย ใจดี',
  102: 'สมหญิง รักสวย'
};

const staffMockDB: Record<number, string> = {
  5: 'ทพ. สมเกียรติ',
  6: 'ทพญ. นภา'
};

const getPatientName = (id: number) => patientMockDB[id] || `คนไข้รหัส ${id}`;
const getStaffName = (id: number) => staffMockDB[id] || `ทันตแพทย์รหัส ${id}`;

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params.id as string;
  
  const formRef = useRef<FormInstance | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && formRef.current && idParam) {
      fetchAppointmentDetail();
    }
  }, [idParam, isMounted]);

  const fetchAppointmentDetail = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      setTimeout(() => {
        const storedData = localStorage.getItem('appointments');
        if (storedData && formRef.current) {
          const appointments = JSON.parse(storedData);
          const targetAppointment = appointments.find((item: any) => item.id === Number(idParam));
          
          if (targetAppointment) {
            let currentStatus = targetAppointment.status;
            if (!['scheduled', 'completed', 'cancelled'].includes(currentStatus)) {
              currentStatus = 'scheduled'; 
            }

            formRef.current.setFieldsValue({
              patient_id: targetAppointment.patient_id,
              staff_id: targetAppointment.staff_id || '', 
              appointment_date: targetAppointment.appointment_date,
              appointment_time: targetAppointment.appointment_time,
              type: targetAppointment.treatment || targetAppointment.type, 
              status: currentStatus 
            });
            setLoading(false);
          } else {
            message.error('ไม่พบข้อมูลการนัดหมายนี้');
            setLoading(false);
            router.push('/personnel/appointment-schedule');
          }
        } else {
          setLoading(false);
        }
      }, 300);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      message.error('ดึงข้อมูลล้มเหลว');
      setLoading(false);
      router.push('/personnel/appointment-schedule');
    }
  };

  const handleUpdate = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        patient_id: Number(values.patient_id),
        staff_id: Number(values.staff_id),
        appointment_date: values.appointment_date,
        appointment_time: values.appointment_time,
        type: values.type,
        status: values.status
      };

      setTimeout(() => {
        const storedData = localStorage.getItem('appointments');
        if (storedData) {
          let appointments = JSON.parse(storedData);
          const index = appointments.findIndex((item: any) => item.id === Number(idParam));
          
          if (index !== -1) {
            // 🌟 แมปปิ้งชื่อจาก ID ที่ผู้ใช้กรอกผ่านฟังก์ชันที่เราเตรียมไว้
            const mockResponse = {
              data: {
                appointment_id: Number(idParam),
                patient: {
                  id: payload.patient_id,
                  name: getPatientName(payload.patient_id)
                },
                staff: {
                  id: payload.staff_id,
                  name: getStaffName(payload.staff_id)
                },
                appointment_date: payload.appointment_date,
                appointment_time: payload.appointment_time,
                type: payload.type,
                status: payload.status,
                medical_record: null,
                inspection_record: null
              }
            };

            const responseData = mockResponse.data;
            appointments[index] = {
              ...appointments[index], 
              patient_id: responseData.patient.id,
              patient_name: responseData.patient.name,
              staff_id: responseData.staff.id,
              staff_name: responseData.staff.name,
              appointment_date: responseData.appointment_date,
              appointment_time: responseData.appointment_time,
              treatment: responseData.type, 
              status: responseData.status
            };

            localStorage.setItem('appointments', JSON.stringify(appointments));
            message.success('อัปเดตข้อมูลสำเร็จ');
            router.push('/personnel/appointment-schedule');
          }
        }
      }, 500);
    } catch (error) {
      message.error('อัปเดตข้อมูลไม่สำเร็จ');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (typeof window === 'undefined') return;
      setTimeout(() => {
        const storedData = localStorage.getItem('appointments');
        if (storedData) {
          let appointments = JSON.parse(storedData);
          appointments = appointments.filter((item: any) => item.id !== Number(idParam));
          localStorage.setItem('appointments', JSON.stringify(appointments));
        }
        message.success('ลบการนัดหมายเรียบร้อยแล้ว');
        router.push('/personnel/appointment-schedule');
      }, 400);
    } catch (error) {
      message.error('ลบการนัดหมายไม่สำเร็จ');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => router.push('/personnel/appointment-schedule')} style={{ marginBottom: '16px', padding: 0 }}>
        กลับไปหน้าตาราง
      </Button>

      <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ marginBottom: '4px' }}>แก้ไขการนัดหมาย (ID: {idParam})</Title>
            <Text type="secondary">ปรับปรุงข้อมูลหรือยกเลิกการนัดหมายนี้</Text>
          </div>
          
          <Popconfirm title="คุณแน่ใจหรือไม่ที่จะยกเลิก/ลบ การนัดหมายนี้?" onConfirm={handleDelete} okText="ยืนยัน" cancelText="ปิด" okButtonProps={{ danger: true }}>
            <Button danger icon={<DeleteOutlined />}>ลบการนัดหมาย</Button>
          </Popconfirm>
        </div>

        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item name="patient_id" label="รหัสคนไข้ (Patient ID)" style={{ flex: 1 }} rules={[{ required: true, message: 'ระบุรหัสคนไข้' }]}>
              <Input type="number" size="large" />
            </Form.Item>
            <Form.Item name="staff_id" label="รหัสทันตแพทย์ (Staff ID)" style={{ flex: 1 }} rules={[{ required: true, message: 'ระบุรหัสทันตแพทย์' }]}>
              <Input type="number" size="large" />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item name="appointment_date" label="วันที่นัด" style={{ flex: 1 }} rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}>
              <Input type="date" size="large" />
            </Form.Item>
            <Form.Item name="appointment_time" label="เวลา" style={{ flex: 1 }} rules={[{ required: true, message: 'กรุณาระบุเวลา' }]}>
              <Input type="time" size="large" />
            </Form.Item>
          </div>

          <Form.Item name="type" label="ประเภท/เรื่องที่นัด (Type)" rules={[{ required: true, message: 'ระบุการรักษา' }]}>
            <Input.TextArea rows={3} size="large" />
          </Form.Item>

          <Form.Item name="status" label="สถานะ (Status)">
            <Select size="large">
              <Select.Option value="scheduled">Scheduled (กำหนดการแล้ว)</Select.Option>
              <Select.Option value="completed">Completed (เสร็จสิ้น)</Select.Option>
              <Select.Option value="cancelled">Cancelled (ยกเลิก)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginTop: '32px', marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button size="large" onClick={() => router.push('/personnel/appointment-schedule')}>ยกเลิก</Button>
              <Button type="primary" size="large" htmlType="submit" icon={<SaveOutlined />} loading={saving}>บันทึกการแก้ไข</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}