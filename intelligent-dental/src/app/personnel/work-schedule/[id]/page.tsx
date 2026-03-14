'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, Typography, Button, Form, Select, TimePicker, message, Spin, Space, Popconfirm, Row, Col, Divider, Tag, Breadcrumb } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined, UserOutlined, ClockCircleOutlined, CalendarOutlined, IdcardOutlined, HomeOutlined, EditOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import type { FormInstance } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface WorkScheduleDetail {
  id: number;
  staff_id: number;
  date: string; // 🌟 ตรวจสอบ GET: อิงตาม API
  start_time: string;
  end_time: string;
  is_active: boolean;
  staff?: {
    first_name: string;
    last_name: string;
    roles?: {
      role_name: string;
    };
  };
}

export default function EditWorkSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params.id as string;
  
  const formRef = useRef<FormInstance | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [scheduleData, setScheduleData] = useState<WorkScheduleDetail | null>(null);

  useEffect(() => {
    formRef.current = form;
    setIsMounted(true);
  }, [form]);

  useEffect(() => {
    if (isMounted && formRef.current && idParam) {
      fetchWorkScheduleDetail();
    }
  }, [idParam, isMounted]);

  // 🌟 เชื่อมต่อข้อมูล: ตรวจสอบ GET ดึงจาก LocalStorage (จำลอง GET /api/work_schedules/{id})
  const fetchWorkScheduleDetail = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      setTimeout(() => {
        const storedData = localStorage.getItem('work_schedules');
        if (storedData) {
          const schedules = JSON.parse(storedData);
          const target = schedules.find((item: any) => item.id === Number(idParam));
          
          if (target) {
            setScheduleData(target);
            if (formRef.current) {
              formRef.current.setFieldsValue({
                date: target.date, // ดึงวันไปแสดงในฟอร์ม
                start_time: dayjs(target.start_time, 'HH:mm:ss'),
                end_time: dayjs(target.end_time, 'HH:mm:ss'),
                is_active: target.is_active
              });
            }
            setLoading(false);
          } else {
            message.error('ไม่พบข้อมูลรายการนี้');
            router.push('/personnel/work-schedule');
          }
        } else {
          setLoading(false);
        }
      }, 500);
    } catch (error) {
      message.error('ดึงข้อมูลล้มเหลว');
      setLoading(false);
    }
  };

  // 🌟 บันทึกการแก้ไข: ตรวจสอบ PUT ส่งฟิลด์ให้ตรง API (PUT /api/work_schedules/{id})
  const handleUpdate = async (values: any) => {
    setSaving(true);
    try {
      const storedData = localStorage.getItem('work_schedules');
      if (storedData) {
        let schedules = JSON.parse(storedData);
        const index = schedules.findIndex((item: any) => item.id === Number(idParam));

        if (index !== -1) {
          // Payload ควบคุมด้วย date
          schedules[index] = {
            ...schedules[index],
            date: values.date, 
            start_time: values.start_time.format('HH:mm:ss'),
            end_time: values.end_time.format('HH:mm:ss'),
            is_active: values.is_active
          };

          localStorage.setItem('work_schedules', JSON.stringify(schedules));
          message.success('อัปเดตวันเวลาทำงานสำเร็จ');
          router.push('/personnel/work-schedule');
        }
      }
    } catch (error) {
      message.error('อัปเดตข้อมูลไม่สำเร็จ');
      setSaving(false);
    }
  };

  // 🌟 ลบข้อมูล: ตรวจสอบ DELETE ลบตาม ID (DELETE /api/work_schedules/{id})
  const handleDelete = async () => {
    try {
      const storedData = localStorage.getItem('work_schedules');
      if (storedData) {
        let schedules = JSON.parse(storedData);
        schedules = schedules.filter((item: any) => item.id !== Number(idParam));
        localStorage.setItem('work_schedules', JSON.stringify(schedules));
        
        message.success('ยกเลิก/ลบ วันเวลาทำงานเรียบร้อยแล้ว');
        router.push('/personnel/work-schedule');
      }
    } catch (error) {
      message.error('ลบข้อมูลไม่สำเร็จ');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <Breadcrumb
        style={{ marginBottom: '24px', fontSize: '15px' }}
        items={[
          { title: <a onClick={() => router.push('/')}><HomeOutlined /> หน้าหลัก</a> },
          { title: <a onClick={() => router.push('/personnel/work-schedule')}><CalendarOutlined /> ตารางการทำงาน</a> },
          { title: <span><EditOutlined /> แก้ไขตารางงาน</span> },
        ]}
      />

      <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ marginBottom: '4px' }}>แก้ไขตารางการทำงาน</Title>
            <Text type="secondary">รหัสรายการ: {idParam}</Text>
          </div>
          <Popconfirm title="คุณแน่ใจหรือไม่ที่จะยกเลิก/ลบ ตารางงานนี้?" onConfirm={handleDelete} okText="ยืนยัน" cancelText="ปิด" okButtonProps={{ danger: true }}>
            <Button danger icon={<DeleteOutlined />}>ลบตารางงาน</Button>
          </Popconfirm>
        </div>

        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '32px' }}>
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <IdcardOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                <Text strong>รหัสทันตแพทย์:</Text>
                <Text>{scheduleData?.staff_id}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <UserOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                <Text strong>ชื่อ-สกุล:</Text>
                <Text>ทพ. {scheduleData?.staff?.first_name} {scheduleData?.staff?.last_name}</Text>
              </div>
            </Col>
            <Col span={24}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IdcardOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                <Text strong>ตำแหน่ง:</Text>
                <Tag color="blue">{scheduleData?.staff?.roles?.role_name || 'ทันตแพทย์'}</Tag>
              </div>
            </Col>
          </Row>
        </div>

        <Divider>แก้ไขข้อมูล</Divider>

        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Row gutter={24}>
            <Col span={24}>
              {/* 🌟 เปลี่ยน name ให้ตรงกับ Payload PUT ของ API */}
              <Form.Item name="date" label={<span><CalendarOutlined /> วันในสัปดาห์</span>} rules={[{ required: true, message: 'กรุณาเลือกวัน' }]}>
                <Select size="large">
                  <Select.Option value="Monday">จันทร์</Select.Option>
                  <Select.Option value="Tuesday">อังคาร</Select.Option>
                  <Select.Option value="Wednesday">พุธ</Select.Option>
                  <Select.Option value="Thursday">พฤหัสบดี</Select.Option>
                  <Select.Option value="Friday">ศุกร์</Select.Option>
                  <Select.Option value="Saturday">เสาร์</Select.Option>
                  <Select.Option value="Sunday">อาทิตย์</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="start_time" label={<span><ClockCircleOutlined /> เวลาเริ่มทำงาน</span>} rules={[{ required: true, message: 'กรุณาระบุเวลาเริ่ม' }]}>
                <TimePicker format="HH:mm" size="large" style={{ width: '100%' }} minuteStep={15} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="end_time" label={<span><ClockCircleOutlined /> เวลาเลิกงาน</span>} rules={[{ required: true, message: 'กรุณาระบุเวลาสิ้นสุด' }]}>
                <TimePicker format="HH:mm" size="large" style={{ width: '100%' }} minuteStep={15} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="is_active" label="สถานะการทำงาน">
                <Select size="large">
                  <Select.Option value={true}>
                    <Tag color="blue" style={{ marginRight: 8 }}>ลงตรวจ</Tag> (Active)
                  </Select.Option>
                  <Select.Option value={false}>
                    <Tag color="error" style={{ marginRight: 8 }}>งดตรวจ</Tag> (Inactive)
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <Space>
              <Button size="large" onClick={() => router.push('/personnel/work-schedule')}>ยกเลิก</Button>
              <Button type="primary" size="large" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                บันทึกการเปลี่ยนแปลง
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}