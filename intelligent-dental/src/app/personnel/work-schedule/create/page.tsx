'use client';

import React, { useMemo, useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Form,
  Select,
  TimePicker,
  message,
  Row,
  Col,
  Divider,
  Space,
  Input,
  Breadcrumb,
} from 'antd';
import {
  SaveOutlined,
  CalendarOutlined,
  IdcardOutlined,
  HomeOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { Rule } from 'antd/es/form';
import type { Dayjs } from 'dayjs';
import { useStaffs } from '@/hook/useStaffs';
import { useWorkSchedule, type WorkSchedule } from '@/hook/useWorkSchedule';

const { Title } = Typography;

const getRoleLabel = (role?: string) => {
  if (role === 'dentist') return 'ทันตแพทย์';
  if (role === 'staff') return 'บุคลากร';
  return role || 'บุคลากร';
};

const getDisplayName = (name?: string, role?: string, id?: number) => {
  const cleanName = name?.replace('null ', '').trim();
  if (cleanName) return cleanName;
  if (id) return `${getRoleLabel(role)} ID: ${id}`;
  return 'ไม่พบชื่อบุคลากร';
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

type FormValues = {
  staff_id: number;
  staff_name?: string;
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

export default function CreateWorkSchedulePage() {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const { data: staffData, loading: staffLoading } = useStaffs();
  const { createSchedule } = useWorkSchedule();

  const startTime = Form.useWatch('start_time', form);
  const endTime = Form.useWatch('end_time', form);

  const selectableStaffs = useMemo(() => {
    return staffData.filter((item) => item.role === 'staff' || item.role === 'dentist');
  }, [staffData]);

  const staffOptions = useMemo(() => {
    return selectableStaffs.map((staff) => ({
      value: staff.id,
      label: `${staff.id} - ${getDisplayName(staff.name, staff.role, staff.id)}`,
      searchText: `${staff.id} ${staff.name} ${staff.role}`.toLowerCase(),
    }));
  }, [selectableStaffs]);

  const handleStaffChange = (value: number) => {
    const staff = selectableStaffs.find((item) => item.id === value);
    form.setFieldsValue({
      staff_name: staff ? getDisplayName(staff.name, staff.role, staff.id) : 'ไม่พบชื่อบุคลากร',
    });
  };

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
    if (!values.start_time.isBefore(values.end_time)) {
      message.error('เวลาเริ่มต้องน้อยกว่าเวลาเลิก');
      return;
    }

    setSubmitting(true);
    try {
      await createSchedule({
        staff_id: values.staff_id,
        date: values.date,
        start_time: values.start_time.format('HH:mm'),
        end_time: values.end_time.format('HH:mm'),
        is_active: values.is_active,
      });

      message.success('เพิ่มตารางการทำงานสำเร็จ');
      router.push('/personnel/work-schedule');
    } catch {
      message.error('บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Breadcrumb
        style={{ marginBottom: '24px', fontSize: '15px' }}
        items={[
          {
            title: (
              <span onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
                <HomeOutlined /> หน้าหลัก
              </span>
            ),
          },
          {
            title: (
              <span
                onClick={() => router.push('/personnel/work-schedule')}
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
        <Title level={3} style={{ marginBottom: '24px' }}>
          เพิ่มตารางการทำงาน
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ is_active: true, date: 'Mon' }}
        >
          <Row gutter={32}>
            <Col span={12}>
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#fafafa',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                }}
              >
                <Divider style={{ marginTop: 0 }}>
                  <Space>
                    <IdcardOutlined /> ข้อมูลบุคลากร
                  </Space>
                </Divider>

                <Form.Item
                  name="staff_id"
                  label="ระบุรหัสบุคลากร (ID)"
                  rules={[{ required: true, message: 'กรุณาเลือกรหัสบุคลากร' }]}
                >
                  <Select
                    showSearch
                    placeholder="พิมพ์ ID หรือเลือกรายชื่อ"
                    size="large"
                    loading={staffLoading}
                    onChange={handleStaffChange}
                    options={staffOptions}
                    filterOption={(input, option) =>
                      String(option?.searchText ?? '').includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item name="staff_name" label="ชื่อ-นามสกุล">
                  <Input
                    disabled
                    placeholder="ชื่อจะขึ้นโดยอัตโนมัติ"
                    size="large"
                    style={{ backgroundColor: '#fff', color: '#000', fontWeight: 'bold' }}
                  />
                </Form.Item>

                <Form.Item name="is_active" label="สถานะเริ่มต้น">
                  <Select
                    size="large"
                    options={[
                      { value: true, label: 'ลงตรวจ (Active)' },
                      { value: false, label: 'งดตรวจ (Inactive)' },
                    ]}
                  />
                </Form.Item>
              </div>
            </Col>

            <Col span={12}>
              <Divider style={{ marginTop: 0 }}>
                <Space>
                  <CalendarOutlined /> กำหนดวันและเวลา
                </Space>
              </Divider>

              <Form.Item name="date" label="วันในสัปดาห์" rules={[{ required: true }]}>
                <Select size="large" options={DAY_OPTIONS} />
              </Form.Item>

              <Row gutter={16}>
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
              </Row>
            </Col>
          </Row>

          <Divider />
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button size="large" onClick={() => router.back()}>
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
