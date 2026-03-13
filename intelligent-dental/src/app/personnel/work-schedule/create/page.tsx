'use client';

import React, { useState } from 'react';
import { Card, Typography, Button, Form, Select, TimePicker, message, Row, Col, Divider, Space, Input, Breadcrumb } from 'antd';
import { SaveOutlined, CalendarOutlined, ClockCircleOutlined, UserOutlined, IdcardOutlined, HomeOutlined, FileAddOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const mockStaffs = [
  { id: 1, name: "ทพ. สมชาย ใจดี" },
  { id: 5, name: "ทพญ. สมหญิง รักษาดี" },
  { id: 10, name: "ทพ. มานะ อดทน" },
];

export default function CreateWorkSchedulePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleStaffChange = (value: number) => {
    const staff = mockStaffs.find(s => s.id === value);
    if (staff) {
      form.setFieldsValue({ staff_name: staff.name });
    } else {
      form.setFieldsValue({ staff_name: "ไม่พบรายชื่อแพทย์" });
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // 🌟 ตรวจสอบ POST: ปรับ Payload เป็น date ตาม API Request Body
      const payload = {
        staff_id: values.staff_id,
        date: values.date, 
        start_time: values.start_time.format('HH:mm:ss'),
        end_time: values.end_time.format('HH:mm:ss'),
        is_active: values.is_active
      };

      setTimeout(() => {
        const storedData = localStorage.getItem('work_schedules');
        let schedules = storedData ? JSON.parse(storedData) : [];
        
        schedules.push({
          id: Date.now(),
          ...payload,
          staff: {
            first_name: values.staff_name,
            last_name: "",
            roles: { role_name: "ทันตแพทย์" }
          }
        });

        localStorage.setItem('work_schedules', JSON.stringify(schedules));
        message.success('เพิ่มตารางการทำงานสำเร็จ');
        router.push('/personnel/work-schedule');
      }, 800);
    } catch (error) {
      message.error('บันทึกไม่สำเร็จ');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Breadcrumb
        style={{ marginBottom: '24px', fontSize: '15px' }}
        items={[
          { title: <span onClick={() => router.push('/')} style={{ cursor: 'pointer' }}><HomeOutlined /> หน้าหลัก</span> },
          { title: <span onClick={() => router.push('/personnel/work-schedule')} style={{ cursor: 'pointer' }}><CalendarOutlined /> ตารางการทำงาน</span> },
          { title: <span><FileAddOutlined /> เพิ่มตารางการทำงาน</span> },
        ]}
      />

      <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Title level={3} style={{ marginBottom: '24px' }}>เพิ่มตารางการทำงาน</Title>

        {/* 🌟 ปรับ initialValues จาก day_of_week เป็น date */}
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ is_active: true, date: 'Monday' }}>
          <Row gutter={32}>
            <Col span={12}>
              <div style={{ padding: '20px', backgroundColor: '#fafafa', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                <Divider style={{ marginTop: 0 }}>
                  <Space><IdcardOutlined /> ข้อมูลทันตแพทย์</Space>
                </Divider>

                <Form.Item name="staff_id" label="ระบุรหัสทันตแพทย์ (ID)" rules={[{ required: true, message: 'กรุณาเลือกรหัสแพทย์' }]}>
                  <Select showSearch placeholder="พิมพ์ ID หรือเลือกรายชื่อ" size="large" onChange={handleStaffChange} optionFilterProp="children">
                    {mockStaffs.map(staff => (
                      <Select.Option key={staff.id} value={staff.id}>{staff.id} - {staff.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="staff_name" label="ชื่อ-นามสกุล">
                  <Input disabled placeholder="ชื่อจะขึ้นโดยอัตโนมัติ" size="large" style={{ backgroundColor: '#fff', color: '#000', fontWeight: 'bold' }} />
                </Form.Item>

                <Form.Item name="is_active" label="สถานะเริ่มต้น">
                  <Select size="large">
                    <Select.Option value={true}>ลงตรวจ (Active)</Select.Option>
                    <Select.Option value={false}>งดตรวจ (Inactive)</Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </Col>

            <Col span={12}>
              <Divider style={{ marginTop: 0 }}>
                <Space><CalendarOutlined /> กำหนดวันและเวลา</Space>
              </Divider>

              {/* 🌟 เปลี่ยนฟิลด์จาก day_of_week เป็น date ตาม API */}
              <Form.Item name="date" label="วันในสัปดาห์" rules={[{ required: true }]}>
                <Select size="large">
                  <Select.Option value="Monday">วันจันทร์</Select.Option>
                  <Select.Option value="Tuesday">วันอังคาร</Select.Option>
                  <Select.Option value="Wednesday">วันพุธ</Select.Option>
                  <Select.Option value="Thursday">วันพฤหัสบดี</Select.Option>
                  <Select.Option value="Friday">วันศุกร์</Select.Option>
                  <Select.Option value="Saturday">วันเสาร์</Select.Option>
                  <Select.Option value="Sunday">วันอาทิตย์</Select.Option>
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="start_time" label="เวลาเริ่ม" rules={[{ required: true }]}>
                    <TimePicker format="HH:mm" size="large" style={{ width: '100%' }} minuteStep={15} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="end_time" label="เวลาเลิก" rules={[{ required: true }]}>
                    <TimePicker format="HH:mm" size="large" style={{ width: '100%' }} minuteStep={15} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider />
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button size="large" onClick={() => router.back()}>ยกเลิก</Button>
              <Button type="primary" size="large" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                บันทึกตารางงาน
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}