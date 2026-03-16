'use client';

import React, { useState } from "react";
import { 
  Button, Card, Typography, Breadcrumb, Form, 
  Select, TimePicker, message, Space, Divider 
} from "antd";
import { useRouter } from "next/navigation";
import { 
  HomeOutlined, CalendarOutlined, LeftOutlined, 
  SaveOutlined, UserOutlined 
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function CreateWorkSchedulePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // ข้อมูลแพทย์ (Fixed เหมือนหน้าหลัก)
  const [currentUser] = useState({
    id: 5,
    first_name: "สมหญิง",
    last_name: "ใจดี",
    role: "ทันตแพทย์เฉพาะทาง"
  });

  const onFinish = (values: any) => {
  setLoading(true);
  try {
    const startTime = values.timeRange[0].format("HH:mm:00"); // เก็บเป็น HH:mm
    const endTime = values.timeRange[1].format("HH:mm:00");

      const newEntry = {
        id: Date.now(),
        staff_id: currentUser.id,
        date: values.date,
        start_time: startTime,
        end_time: endTime,
        is_active: values.status === 'active',
        staff: {
          first_name: currentUser.first_name,
          last_name: currentUser.last_name,
          roles: { role_name: currentUser.role }
        }
      };

      // ดึงข้อมูลเดิมจาก LocalStorage มาต่อท้าย
      const storedData = localStorage.getItem('work_schedules');
      const currentSchedules = storedData ? JSON.parse(storedData) : [];
      const updatedData = [...currentSchedules, newEntry];

      localStorage.setItem('work_schedules', JSON.stringify(updatedData));
      
      message.success('บันทึกตารางการทำงานใหม่เรียบร้อยแล้ว');
      router.push('/personnel/work-schedule'); // บันทึกเสร็จแล้วกลับไปหน้าตาราง
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      

      <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Button 
              type="text" 
              icon={<LeftOutlined />} 
              onClick={() => router.back()} 
              style={{ marginBottom: '8px', padding: 0 }}
            >
              ย้อนกลับ
            </Button>
            <Title level={3} style={{ margin: 0 }}>ลงทะเบียนตารางงานใหม่</Title>
            <Text type="secondary">กรอกรายละเอียดช่วงเวลาที่ต้องการลงตรวจ</Text>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          <Form form={form} layout="vertical" onFinish={onFinish}>
            {/* ข้อมูลแพทย์ (Read-only) */}
            <Form.Item label="แพทย์ผู้ปฏิบัติงาน">
              <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', border: '1px solid #d9d9d9' }}>
                 <UserOutlined /> <Text strong>ทพ. {currentUser.first_name} {currentUser.last_name}</Text>
                 <br />
                 <Text type="secondary" style={{ fontSize: '12px', marginLeft: '22px' }}>{currentUser.role}</Text>
              </div>
            </Form.Item>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item 
                name="date" 
                label="วันที่ต้องการลงตรวจ" 
                rules={[{ required: true, message: 'กรุณาเลือกวัน' }]}
              >
                <Select size="large" placeholder="เลือกวันในสัปดาห์">
                  <Select.Option value="Monday">จันทร์</Select.Option>
                  <Select.Option value="Tuesday">อังคาร</Select.Option>
                  <Select.Option value="Wednesday">พุธ</Select.Option>
                  <Select.Option value="Thursday">พฤหัสบดี</Select.Option>
                  <Select.Option value="Friday">ศุกร์</Select.Option>
                  <Select.Option value="Saturday">เสาร์</Select.Option>
                  <Select.Option value="Sunday">อาทิตย์</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item 
                name="status" 
                label="สถานะ" 
                initialValue="active"
              >
                <Select size="large">
                  <Select.Option value="active">ลงตรวจ (Active)</Select.Option>
                  <Select.Option value="inactive">งดตรวจ (Inactive)</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item 
  name="timeRange" 
  label="ช่วงเวลาลงตรวจ (ระบุนาทีได้)" 
  rules={[{ required: true, message: 'กรุณาระบุช่วงเวลา' }]}
>
  <TimePicker.RangePicker 
    format="HH:mm"           // เปลี่ยนจาก HH:00 เป็น HH:mm
    minuteStep={15}         // กำหนดให้เลือกได้ทุกๆ 15 นาที (หรือ 1, 5, 10 ตามใจชอบ)
    showNow={false} 
    size="large" 
    style={{ width: '100%' }}
    hideDisabledOptions
  />
</Form.Item>

            <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button size="large" onClick={() => router.back()}>
                  ยกเลิก
                </Button>
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<SaveOutlined />} 
                  htmlType="submit" 
                  loading={loading}
                >
                  บันทึกตารางงาน
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
}