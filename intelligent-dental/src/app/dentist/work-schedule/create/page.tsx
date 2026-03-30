'use client';

import React, { useState } from 'react';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Row,
  Select,
  Space,
  TimePicker,
  Typography,
  message,
} from 'antd';
import {
  CalendarOutlined,
  FileAddOutlined,
  HomeOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { Rule } from 'antd/es/form';
import type { Dayjs } from 'dayjs';
import { getUserIdFromToken } from '@/app/utils/auth.client';
import { type WorkSchedule, useWorkSchedule } from '@/hook/useWorkSchedule';

const { Title, Text } = Typography;

const DAY_OPTIONS: { value: WorkSchedule['date']; label: string }[] = [
  { value: 'Mon', label: 'วันจันทร์' },
  { value: 'Tue', label: 'วันอังคาร' },
  { value: 'Wed', label: 'วันพุธ' },
  { value: 'Thu', label: 'วันพฤหัสบดี' },
  { value: 'Fri', label: 'วันศุกร์' },
  { value: 'Sat', label: 'วันเสาร์' },
  { value: 'Sun', label: 'วันอาทิตย์' },
];

type FormValues = {
  date: WorkSchedule['date'];
  start_time: Dayjs;
  end_time: Dayjs;
  is_active: boolean;
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
      ...Array.from(
        { length: 24 - (endTime.hour() + 1) },
        (_, index) => endTime.hour() + 1 + index,
      ),
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

export default function DentistCreateWorkSchedulePage() {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const { createSchedule } = useWorkSchedule();

  const dentistId = getUserIdFromToken();
  const startTime = Form.useWatch('start_time', form);
  const endTime = Form.useWatch('end_time', form);

  const startTimeRule: Rule = {
    validator: async (_, value: Dayjs | undefined) => {
      if (!value || !endTime || value.isBefore(endTime)) return;
      throw new Error('เวลาเริ่มต้องน้อยกว่าเวลาเลิก');
    },
  };

  const endTimeRule: Rule = {
    validator: async (_, value: Dayjs | undefined) => {
      if (!value || !startTime || value.isAfter(startTime)) return;
      throw new Error('เวลาเลิกต้องมากกว่าเวลาเริ่ม');
    },
  };

  const onFinish = async (values: FormValues) => {
    if (!dentistId) {
      message.error('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    if (!values.start_time.isBefore(values.end_time)) {
      message.error('เวลาเริ่มต้องน้อยกว่าเวลาเลิก');
      return;
    }

    setSubmitting(true);
    try {
      await createSchedule({
        staff_id: dentistId,
        date: values.date,
        start_time: values.start_time.format('HH:mm'),
        end_time: values.end_time.format('HH:mm'),
        is_active: values.is_active,
      });

      message.success('เพิ่มตารางการทำงานสำเร็จ');
      router.push('/dentist/work-schedule');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <Breadcrumb
        style={{ marginBottom: '24px', fontSize: '15px' }}
        items={[
          {
            title: (
              <span onClick={() => router.push('/dentist')} style={{ cursor: 'pointer' }}>
                <HomeOutlined /> หน้าหลัก
              </span>
            ),
          },
          {
            title: (
              <span
                onClick={() => router.push('/dentist/work-schedule')}
                style={{ cursor: 'pointer' }}
              >
                <CalendarOutlined /> ตารางการทำงาน
              </span>
            ),
          },
          {
            title: (
              <span>
                <FileAddOutlined /> เพิ่มตารางการทำงาน
              </span>
            ),
          },
        ]}
      />

      <Card
        variant="borderless"
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <Title level={3} style={{ marginBottom: '4px' }}>
          เพิ่มตารางการทำงาน
        </Title>
        <Text type="secondary">ระบบจะบันทึกตารางนี้ให้กับทันตแพทย์เจ้าของบัญชีที่ล็อกอินอยู่</Text>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ is_active: true, date: 'Mon' }}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item name="date" label="วันในสัปดาห์" rules={[{ required: true }]}>
                <Select size="large" options={DAY_OPTIONS} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="start_time"
                label="เวลาเริ่ม"
                rules={[{ required: true }, startTimeRule]}
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
                label="เวลาเลิก"
                rules={[{ required: true }, endTimeRule]}
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
              <Form.Item name="is_active" label="สถานะเริ่มต้น">
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

          <Divider />
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button size="large" onClick={() => router.push('/dentist/work-schedule')}>
                ยกเลิก
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
              >
                บันทึกตารางงาน
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}
