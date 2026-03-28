'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  TimePicker,
  Typography,
  message,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  IdcardOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { withAuthHeaders } from '@/app/utils/auth.client';
import type { WorkSchedule } from '@/hook/useWorkSchedule';

const { Title, Text } = Typography;

type WorkScheduleDetail = WorkSchedule & {
  staff?: {
    id: string;
    name: string;
    role: string;
  };
};

type FormValues = {
  date: WorkSchedule['date'];
  start_time: Dayjs;
  end_time: Dayjs;
  is_active: boolean;
};

const DAY_OPTIONS: { value: WorkSchedule['date']; label: string }[] = [
  { value: 'Mon', label: 'วันจันทร์' },
  { value: 'Tue', label: 'วันอังคาร' },
  { value: 'Wed', label: 'วันพุธ' },
  { value: 'Thu', label: 'วันพฤหัสบดี' },
  { value: 'Fri', label: 'วันศุกร์' },
  { value: 'Sat', label: 'วันเสาร์' },
  { value: 'Sun', label: 'วันอาทิตย์' },
];

const getRoleLabel = (role?: string) => {
  if (role === 'dentist') return 'ทันตแพทย์';
  if (role === 'staff') return 'บุคลากร';
  return role || 'บุคลากร';
};

const baseDisabledHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 19, 20, 21, 22, 23];

const buildEndTimeDisabled = (startTime?: Dayjs | null) => ({
  disabledHours: () => {
    if (!startTime) return baseDisabledHours;
    return [...baseDisabledHours, ...Array.from({ length: startTime.hour() }, (_, hour) => hour)];
  },
  disabledMinutes: (selectedHour: number) => {
    if (!startTime || selectedHour !== startTime.hour()) return [];
    return Array.from(
      { length: Math.floor(startTime.minute() / 15) + 1 },
      (_, index) => index * 15,
    );
  },
});

const buildStartTimeDisabled = (endTime?: Dayjs | null) => ({
  disabledHours: () => {
    if (!endTime) return baseDisabledHours;
    return [
      ...baseDisabledHours,
      ...Array.from({ length: 24 - (endTime.hour() + 1) }, (_, index) => endTime.hour() + 1 + index),
    ];
  },
  disabledMinutes: (selectedHour: number) => {
    if (!endTime || selectedHour !== endTime.hour()) return [];
    const disabledMinutes: number[] = [];
    for (let minute = endTime.minute(); minute < 60; minute += 15) {
      disabledMinutes.push(minute);
    }
    return disabledMinutes;
  },
});

export default function EditWorkSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const scheduleId = Number(params.id);
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scheduleData, setScheduleData] = useState<WorkScheduleDetail | null>(null);

  const startTime = Form.useWatch('start_time', form);
  const endTime = Form.useWatch('end_time', form);

  const fetchScheduleDetail = useCallback(async () => {
    if (!Number.isInteger(scheduleId) || scheduleId <= 0) {
      message.error('รหัสรายการไม่ถูกต้อง');
      router.push('/personnel/work-schedule');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/work_schedules/${scheduleId}`, {
        cache: 'no-store',
        headers: withAuthHeaders(),
      });

      const result = (await response.json()) as { data?: WorkScheduleDetail; error?: { message?: string } };

      if (!response.ok || !result.data) {
        throw new Error(result.error?.message || 'ไม่พบข้อมูลตารางงาน');
      }

      setScheduleData(result.data);
      form.setFieldsValue({
        date: result.data.date,
        start_time: dayjs(result.data.start_time, 'HH:mm'),
        end_time: dayjs(result.data.end_time, 'HH:mm'),
        is_active: result.data.is_active,
      });
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'ดึงข้อมูลล้มเหลว');
      router.push('/personnel/work-schedule');
    } finally {
      setLoading(false);
    }
  }, [form, router, scheduleId]);

  useEffect(() => {
    void fetchScheduleDetail();
  }, [fetchScheduleDetail]);

  const handleUpdate = async (values: FormValues) => {
    if (!values.start_time.isBefore(values.end_time)) {
      message.error('เวลาเริ่มต้องน้อยกว่าเวลาเลิก');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/work_schedules/${scheduleId}`, {
        method: 'PUT',
        headers: withAuthHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          date: values.date,
          start_time: values.start_time.format('HH:mm'),
          end_time: values.end_time.format('HH:mm'),
          is_active: values.is_active,
        }),
      });

      const result = response.status === 204
        ? null
        : ((await response.json()) as { error?: { message?: string } });

      if (!response.ok) {
        throw new Error(result?.error?.message || 'อัปเดตข้อมูลไม่สำเร็จ');
      }

      message.success('อัปเดตตารางการทำงานสำเร็จ');
      router.push('/personnel/work-schedule');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'อัปเดตข้อมูลไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/work_schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: withAuthHeaders(),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: { message?: string } };
        throw new Error(result.error?.message || 'ลบข้อมูลไม่สำเร็จ');
      }

      message.success('ยกเลิกตารางการทำงานเรียบร้อยแล้ว');
      router.push('/personnel/work-schedule');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'ลบข้อมูลไม่สำเร็จ');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <Breadcrumb
        style={{ marginBottom: '24px', fontSize: '15px' }}
        items={[
          {
            title: (
              <a onClick={() => router.push('/')}>
                <HomeOutlined /> หน้าหลัก
              </a>
            ),
          },
          {
            title: (
              <a onClick={() => router.push('/personnel/work-schedule')}>
                <CalendarOutlined /> ตารางการทำงาน
              </a>
            ),
          },
          {
            title: (
              <span>
                <EditOutlined /> แก้ไขตารางงาน
              </span>
            ),
          },
        ]}
      />

      <Card
        variant="borderless"
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <div>
            <Title level={3} style={{ marginBottom: '4px' }}>
              แก้ไขตารางการทำงาน
            </Title>
            <Text type="secondary">รหัสรายการ: {scheduleId}</Text>
          </div>
          <Popconfirm
            title="ยืนยันการยกเลิกตารางงานนี้?"
            onConfirm={handleDelete}
            okText="ยืนยัน"
            cancelText="ปิด"
            okButtonProps={{ danger: true, loading: saving }}
          >
            <Button danger icon={<DeleteOutlined />} loading={saving}>
              ยกเลิกตารางงาน
            </Button>
          </Popconfirm>
        </div>

        <div
          style={{
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '32px',
          }}
        >
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <IdcardOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                <Text strong>รหัสบุคลากร:</Text>
                <Text>{scheduleData?.staff?.id || '-'}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <UserOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                <Text strong>ชื่อ-สกุล:</Text>
                <Text>{scheduleData?.staff?.name || '-'}</Text>
              </div>
            </Col>
            <Col span={24}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IdcardOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                <Text strong>ตำแหน่ง:</Text>
                <Tag color="blue">{getRoleLabel(scheduleData?.staff?.role)}</Tag>
              </div>
            </Col>
          </Row>
        </div>

        <Divider>แก้ไขข้อมูล</Divider>

        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="date"
                label={
                  <span>
                    <CalendarOutlined /> วันในสัปดาห์
                  </span>
                }
                rules={[{ required: true, message: 'กรุณาเลือกวัน' }]}
              >
                <Select size="large" options={DAY_OPTIONS} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="start_time"
                label={
                  <span>
                    <ClockCircleOutlined /> เวลาเริ่มทำงาน
                  </span>
                }
                rules={[
                  { required: true, message: 'กรุณาระบุเวลาเริ่ม' },
                  {
                    validator: async (_, value: Dayjs | undefined) => {
                      if (!value || !endTime || value.isBefore(endTime)) return;
                      throw new Error('เวลาเริ่มต้องน้อยกว่าเวลาเลิก');
                    },
                  },
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  size="large"
                  style={{ width: '100%' }}
                  minuteStep={15}
                  hideDisabledOptions
                  disabledTime={() => buildStartTimeDisabled(endTime)}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="end_time"
                label={
                  <span>
                    <ClockCircleOutlined /> เวลาเลิกงาน
                  </span>
                }
                rules={[
                  { required: true, message: 'กรุณาระบุเวลาสิ้นสุด' },
                  {
                    validator: async (_, value: Dayjs | undefined) => {
                      if (!value || !startTime || value.isAfter(startTime)) return;
                      throw new Error('เวลาเลิกต้องมากกว่าเวลาเริ่ม');
                    },
                  },
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  size="large"
                  style={{ width: '100%' }}
                  minuteStep={15}
                  hideDisabledOptions
                  disabledTime={() => buildEndTimeDisabled(startTime)}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="is_active" label="สถานะการทำงาน">
                <Select
                  size="large"
                  options={[
                    { value: true, label: 'ลงตรวจ (Active)' },
                    { value: false, label: 'งดตรวจ (Inactive)' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <Space>
              <Button size="large" onClick={() => router.push('/personnel/work-schedule')}>
                ยกเลิก
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                บันทึกการเปลี่ยนแปลง
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}
