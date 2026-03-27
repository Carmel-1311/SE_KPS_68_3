'use client';

import React, { useEffect } from 'react';
import { Card, Typography, Button, Input, Form, Space, Breadcrumb, Select } from 'antd';
import { SaveOutlined, HomeOutlined, CalendarOutlined, FileAddOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useCreateAppointment } from '@/hook/useCreateAppointment';

const { Title, Text } = Typography;

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CreateAppointmentPage() {
  const router = useRouter();
  const [form] = Form.useForm();

  // ── Data ───────────────────────────────────────────────────────────────────

  const {
    createAppointment,
    loading,
    availableSlots,
    loadingSlots,
    fetchAvailableSlots,
    patients,
    loadingPatients,
  } = useCreateAppointment();

  const selectedDate = Form.useWatch('appointment_date', form);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(new Date(selectedDate).toISOString());
      form.setFieldValue('appointment_time', undefined);
    } else {
      form.setFieldValue('appointment_time', undefined);
    }
  }, [selectedDate, fetchAvailableSlots, form]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreate = async (values: {
    patient_id: number;
    appointment_date: string;
    appointment_time: string;
    type: string;
  }) => {
    await createAppointment(
      {
        patient_id:       values.patient_id,
        appointment_date: new Date(values.appointment_date).toISOString(),
        appointment_time: values.appointment_time,
        type:             values.type,
      },
      () => router.push('/personnel/appointment-schedule')
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>

      <Breadcrumb
        style={{ marginBottom: '24px', fontSize: '15px' }}
        items={[
          { title: <a onClick={() => router.push('/')}><HomeOutlined /> หน้าหลัก</a> },
          { title: <a onClick={() => router.push('/personnel/appointment-schedule')}><CalendarOutlined /> ตารางการนัดหมาย</a> },
          { title: <span><FileAddOutlined /> เพิ่มการนัดหมาย</span> },
        ]}
      />

      <Card
        variant="borderless"
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <Title level={3} style={{ marginBottom: '4px' }}>เพิ่มการนัดหมายใหม่</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
          กรอกข้อมูลเพื่อสร้างคิวการนัดหมายใหม่เข้าระบบ
        </Text>

        <Form form={form} layout="vertical" onFinish={handleCreate}>

          {/* Patient & Date */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Form.Item
              name="patient_id"
              label="คนไข้"
              style={{ flex: 1, minWidth: '250px' }}
              rules={[{ required: true, message: 'กรุณาเลือกคนไข้' }]}
            >
              <Select
                size="large"
                placeholder="เลือกคนไข้"
                loading={loadingPatients}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={patients.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="appointment_date"
              label="วันที่นัด"
              style={{ flex: 1, minWidth: '250px' }}
              rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
            >
              <Input type="date" size="large" />
            </Form.Item>
          </div>

          {/* Time & Type */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Form.Item
              name="appointment_time"
              label="เวลา (แสดงเฉพาะช่วงที่ว่าง)"
              style={{ flex: 1, minWidth: '250px' }}
              rules={[{ required: true, message: 'กรุณาเลือกเวลา' }]}
            >
              <Select
                size="large"
                placeholder={!selectedDate ? 'กรุณาเลือกวันที่ก่อน' : 'เลือกเวลา'}
                disabled={!selectedDate}
                loading={loadingSlots}
              >
                {availableSlots.map((slot) => (
                  <Select.Option key={slot.time} value={slot.time}>
                    {slot.time} น.
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="type"
              label="ประเภทการรักษา"
              style={{ flex: 1, minWidth: '250px' }}
              rules={[{ required: true, message: 'ระบุประเภทการนัดหมาย' }]}
            >
              <Select size="large" placeholder="เลือกประเภทการรักษา">
                {['ตรวจฟัน', 'อุดฟัน', 'ขูดหินปูน', 'ถอนฟัน', 'รักษารากฟัน', 'ครอบฟัน', 'ฟอกสีฟัน'].map((t) => (
                  <Select.Option key={t} value={t}>{t}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {/* Actions */}
          <Form.Item style={{ marginTop: '32px', marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button size="large" onClick={() => router.push('/personnel/appointment-schedule')}>
                ยกเลิก
              </Button>
              <Button type="primary" size="large" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                บันทึกข้อมูล
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}