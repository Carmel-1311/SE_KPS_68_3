'use client';

import React, { useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Input,
  Form,
  Select,
  Spin,
  Space,
  Modal,
  Breadcrumb,
  Divider,
  Tag,
} from 'antd';
import {
  SaveOutlined,
  DeleteOutlined,
  HomeOutlined,
  EditOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import dayjs from 'dayjs';

import { useEditAppointment } from '@/hook/useEditAppointment';

const { Title, Text } = Typography;

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params.id as string;

  const [form] = Form.useForm();
  const [isCancelModalVisible, setIsCancelModalVisible] = React.useState(false);

  const {
    appointment,
    loading,
    saving,
    availableSlots,
    loadingSlots,
    fetchAvailableSlots,
    updateAppointment,
    deleteAppointment,
  } = useEditAppointment(idParam);

  // ── เติมข้อมูลฟอร์ม ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!appointment) return;

    const dateOnly = dayjs(appointment.appointment_date).format('YYYY-MM-DD');

    form.setFieldsValue({
      appointment_date: dateOnly,
      // ✅ เดิมพอ ไม่ต้องแก้
      appointment_time: dayjs(`2000-01-01 ${appointment.appointment_time}`).subtract(0, 'hour').format('HH:mm'),
      type: appointment.type,
      status: appointment.status,
    });

    fetchAvailableSlots(appointment.appointment_date);
  }, [appointment, form, fetchAvailableSlots]);

  // ── ฟังก์ชันจัดการ ────────────────────────────────────────────────────────

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setFieldValue('appointment_time', undefined);
    fetchAvailableSlots(new Date(e.target.value).toISOString());
  };

  const handleUpdate = async (values: {
    appointment_date: string;
    appointment_time: string;
    type: string;
    status: "scheduled" | "completed" | "cancelled" | "request_cancel";
  }) => {
    if (!appointment) return;

    await updateAppointment(
      {
        appointment_date: values.appointment_date,
        appointment_time: new Date(`2026-01-01T${dayjs(`2000-01-01 ${values.appointment_time}`).add(7, 'hour').format('HH:mm:ss')}`).toISOString(),
        type: values.type,
        status: values.status,
        staff_id: appointment.staff.id,
      },
      () => router.push('/personnel/appointment-schedule')
    );
  };

  const handleConfirmDelete = async () => {
    await deleteAppointment(() => {
      setIsCancelModalVisible(false);
      router.push('/personnel/appointment-schedule');
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  }

  if (!appointment) return null;

  // ── Derived State ─────────────────────────────────────────────────────────

  const isRequestCancel = appointment.status === 'request_cancel';
  const isCompleted     = appointment.status === 'completed';
  const isReadOnly      = isRequestCancel || isCompleted;

  // ── แสดงผล ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>

      <Breadcrumb
        style={{ marginBottom: '24px', fontSize: '15px' }}
        items={[
          { title: <a onClick={() => router.push('/')}><HomeOutlined /> หน้าหลัก</a> },
          { title: <a onClick={() => router.push('/personnel/appointment-schedule')}><CalendarOutlined /> ตารางการนัดหมาย</a> },
          { title: <span><EditOutlined /> แก้ไขการนัดหมาย</span> },
        ]}
      />

      <Card
        variant="borderless"
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ marginBottom: '4px' }}>
              แก้ไขการนัดหมาย (รหัส: {appointment.appointment_id})
            </Title>
            <Text type="secondary">ปรับปรุงข้อมูลหรือสถานะของการนัดหมายนี้</Text>
          </div>
          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={appointment.status === 'cancelled'}
            onClick={() => setIsCancelModalVisible(true)}
          >
            ยกเลิกการนัดหมาย
          </Button>
        </div>

        <Form form={form} layout="vertical" onFinish={handleUpdate}>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Form.Item label="คนไข้" style={{ flex: 1, minWidth: '250px' }}>
              <Input size="large" value={appointment.patient.name} disabled />
            </Form.Item>
            <Form.Item label="ทันตแพทย์" style={{ flex: 1, minWidth: '250px' }}>
              <Input size="large" value={appointment.staff.name} disabled />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Form.Item
              name="appointment_date"
              label="วันที่นัด"
              style={{ flex: 1, minWidth: '250px' }}
              rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
            >
              <Input type="date" size="large" onChange={handleDateChange} disabled={isReadOnly} />
            </Form.Item>

            <Form.Item
              name="appointment_time"
              label="เวลา (เฉพาะช่วงที่ว่าง)"
              style={{ flex: 1, minWidth: '250px' }}
              rules={[{ required: true, message: 'กรุณาเลือกเวลา' }]}
            >
              <Select size="large" placeholder="เลือกเวลา" loading={loadingSlots} disabled={isReadOnly || loadingSlots}>
                {availableSlots.map((slot) => {
                  const displayTime = dayjs(`2000-01-01 ${slot.time}`).subtract(7, 'hour').format('HH:mm');
                  return (
                    <Select.Option key={slot.time} value={displayTime}>
                      {displayTime} น.
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="type"
            label="ประเภทการรักษา"
            rules={[{ required: true, message: 'ระบุประเภทการนัดหมาย' }]}
          >
            <Select size="large" placeholder="เลือกประเภทการรักษา" disabled={isReadOnly}>
              {['ตรวจฟัน', 'อุดฟัน', 'ขูดหินปูน', 'ถอนฟัน', 'รักษารากฟัน', 'ครอบฟัน', 'ฟอกสีฟัน'].map((t) => (
                <Select.Option key={t} value={t}>{t}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Divider />

          <Form.Item label="สถานะ">
            <Form.Item name="status" noStyle>
              <Select size="large">
                <Select.Option value="scheduled">รอดำเนินการ</Select.Option>
                <Select.Option value="completed">เสร็จสิ้น</Select.Option>
                <Select.Option value="cancelled">ยกเลิกการนัดหมาย</Select.Option>
                {appointment.status === 'request_cancel' && (
                  <Select.Option value="request_cancel">ส่งคำขอยกเลิกแล้ว</Select.Option>
                )}
              </Select>
            </Form.Item>

            {appointment.status === 'request_cancel' && (
              <Text type="warning" style={{ marginTop: '8px', display: 'block' }}>
                * ผู้ป่วยส่งคำขอยกเลิกมา กรุณาเปลี่ยนสถานะเป็น "ยกเลิกการนัดหมาย" เพื่อยืนยัน
              </Text>
            )}
          </Form.Item>

          <Form.Item style={{ marginTop: '32px', marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button size="large" onClick={() => router.push('/personnel/appointment-schedule')}>
                ย้อนกลับ
              </Button>
              {!isReadOnly && (
                <Button type="primary" size="large" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                  บันทึกการแก้ไข
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title={<span><DeleteOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />ยืนยันการยกเลิกนัดหมาย</span>}
        open={isCancelModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsCancelModalVisible(false)}
        okText="ยืนยันยกเลิก"
        cancelText="ปิด"
        okButtonProps={{ danger: true }}
      >
        <Text>คุณแน่ใจหรือไม่ที่จะยกเลิกการนัดหมายนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</Text>
      </Modal>
    </div>
  );
}