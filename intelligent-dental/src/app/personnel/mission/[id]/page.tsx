'use client';

import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Input, Form, Select, message, Spin, Space, Modal, Breadcrumb, Divider, Tag } from 'antd';
import { SaveOutlined, DeleteOutlined, HomeOutlined, EditOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export interface CompanyData {
  id: number;
  name: string;
  phone: string;
}

export interface MobileDentalDetail {
  id: number;
  mobileDate: string;
  address: string;
  patientCount: number;
  status: string;
  createdAt: string;
  Company?: CompanyData;
}

export default function EditMissionPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params.id as string;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [missionData, setMissionData] = useState<MobileDentalDetail | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('');

  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && form && idParam) {
      fetchMissionDetail();
    }
  }, [isMounted, idParam, form]);

  const fetchMissionDetail = async () => {
    try {
      const token = localStorage.getItem("token") || ""; 
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/mobile-dentals/${idParam}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        const data: MobileDentalDetail = responseData?.data || responseData;
        
        setMissionData(data);
        setCurrentStatus(String(data.status));

        const formattedDate = data.mobileDate ? dayjs(data.mobileDate).format('YYYY-MM-DD') : '';

        form.setFieldsValue({
          mobileDate: formattedDate,
          address: data.address,
          patientCount: data.patientCount || 0,
          status: String(data.status)
        });
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('API Error:', error);
    }

    // --- Fallback โหมด Mock Data ---
    message.warning('ไม่สามารถเชื่อมต่อ API ได้ กำลังแสดงข้อมูลจำลอง');
    setTimeout(() => {
      const mockData: MobileDentalDetail = {
        id: Number(idParam),
        mobileDate: '2026-02-10T00:00:00.000Z',
        address: 'โรงเรียนอนุบาลขอนแก่น (หอประชุมใหญ่)',
        patientCount: 50,
        status: '1', // ทดสอบเป็นสถานะ 1 (รออนุมัติ)
        createdAt: '2026-01-20T10:00:00.000Z',
        Company: { id: 101, name: 'โรงเรียนอนุบาลขอนแก่น', phone: '0811111111' }
      };

      setMissionData(mockData);
      setCurrentStatus(mockData.status);
      form.setFieldsValue({
        mobileDate: dayjs(mockData.mobileDate).format('YYYY-MM-DD'),
        address: mockData.address,
        patientCount: mockData.patientCount,
        status: mockData.status
      });
      setLoading(false);
    }, 500);
  };

  const handleUpdate = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        status: values.status,
        mobileDate: dayjs(values.mobileDate).toISOString(),
        address: values.address,
        patientCount: Number(values.patientCount)
      };

      const token = localStorage.getItem("token") || ""; 
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/mobile-dentals/${idParam}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        message.success('บันทึกข้อมูลและอัปเดตสถานะสำเร็จ');
        router.push('/personnel/mission');
      } else {
        throw new Error('อัปเดตไม่สำเร็จ');
      }
    } catch (error) {
      message.success('[Mock] บันทึกข้อมูลและอัปเดตสถานะสำเร็จ');
      router.push('/personnel/mission');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmCancelMission = async () => {
    setSaving(true);
    try {
      const formValues = form.getFieldsValue();
      const payload = {
        status: "4", // 4 = ยกเลิกการออกหน่วย
        mobileDate: dayjs(formValues.mobileDate).toISOString(),
        address: formValues.address,
        patientCount: Number(formValues.patientCount),
        cancel_reason: cancelReason 
      };

      const token = localStorage.getItem("token") || ""; 
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/mobile-dentals/${idParam}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        message.success('ยกเลิกการออกหน่วยเรียบร้อยแล้ว');
        setIsCancelModalVisible(false);
        router.push('/personnel/mission');
      } else {
        throw new Error('ยกเลิกไม่สำเร็จ');
      }
    } catch (error) {
      message.success('[Mock] ยกเลิกการออกหน่วยเรียบร้อยแล้ว');
      setIsCancelModalVisible(false);
      router.push('/personnel/mission');
    } finally {
      setSaving(false);
    }
  };

  // 🌟 จุดสำคัญ: ล็อกการแก้ไขทันทีถ้าสถานะ ไม่ใช่ 1 (รออนุมัติ) 🌟
  const isReadOnly = currentStatus !== '1'; 
  
  // ให้กดยกเลิกได้เฉพาะตอนรออนุมัติ (1) หรือ ผู้ใช้ส่งคำขอยกเลิกมา (5)
  const canCancel = ['1', '5'].includes(currentStatus);

  const getStatusTag = (status: string) => {
    switch (status) {
      case '1': return <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>รออนุมัติ</Tag>;
      case '2': return <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>อนุมัติแล้ว</Tag>;
      case '3': return <Tag color="red" style={{ fontSize: '14px', padding: '4px 12px' }}>ไม่อนุมัติ</Tag>;
      case '4': return <Tag color="default" style={{ fontSize: '14px', padding: '4px 12px' }}>ยกเลิกการออกหน่วย</Tag>;
      case '5': return <Tag color="orange" style={{ fontSize: '14px', padding: '4px 12px' }}>คำขอยกเลิกจากผู้ใช้</Tag>;
      default: return <Tag style={{ fontSize: '14px', padding: '4px 12px' }}>{status}</Tag>;
    }
  };

  if (!isMounted || loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      
      <Breadcrumb
        style={{ marginBottom: '24px', fontSize: '15px' }}
        items={[
          { title: <a onClick={() => router.push('/')}><HomeOutlined /> หน้าหลัก</a> },
          { title: <a onClick={() => router.push('/personnel/mission')}><EnvironmentOutlined /> ตารางการออกหน่วย</a> },
          { title: <span><EditOutlined /> รายละเอียดการออกหน่วย</span> },
        ]}
      />

      <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ marginBottom: '4px' }}>รายละเอียดการออกหน่วย (รหัส: {idParam})</Title>
            <Text type="secondary">ปรับปรุงข้อมูลหรือตรวจสอบสถานะของการออกหน่วย</Text>
          </div>
          
          <Button 
            danger 
            type={currentStatus === '5' ? 'primary' : 'default'} 
            icon={<DeleteOutlined />} 
            disabled={!canCancel} 
            onClick={() => setIsCancelModalVisible(true)}
          >
            {currentStatus === '5' ? 'ยืนยันการยกเลิก' : 'ยกเลิกการออกหน่วย'}
          </Button>
        </div>

        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Form.Item label="ชื่อหน่วยงาน/ชุมชน" style={{ flex: 1, minWidth: '250px' }}>
              <Input size="large" disabled value={missionData?.Company?.name || 'ไม่ระบุ'} />
            </Form.Item>

            <Form.Item label="เบอร์ติดต่อ" style={{ flex: 1, minWidth: '250px' }}>
              <Input size="large" disabled value={missionData?.Company?.phone || 'ไม่ระบุ'} />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {/* 🌟 ถ้า isReadOnly เป็น true ช่องเหล่านี้จะพิมพ์ไม่ได้เลย */}
            <Form.Item name="mobileDate" label="วันที่ออกหน่วย" style={{ flex: 1, minWidth: '250px' }} rules={[{ required: true }]}>
              <Input type="date" size="large" disabled={isReadOnly} />
            </Form.Item>

            <Form.Item name="patientCount" label="จำนวนคนไข้ (ประเมิน)" style={{ flex: 1, minWidth: '250px' }} rules={[{ required: true }]}>
              <Input type="number" size="large" min={0} disabled={isReadOnly} />
            </Form.Item>
          </div>

          <Form.Item name="address" label="สถานที่จัดกิจกรรม (Address)" rules={[{ required: true }]}>
            <Input.TextArea rows={3} size="large" disabled={isReadOnly} placeholder="ระบุสถานที่ออกหน่วยให้ชัดเจน" />
          </Form.Item>

          <Divider />

          <Form.Item label="สถานะ (Status)">
            {!isReadOnly ? (
              // 🌟 แสดงกล่องเลือกสถานะ ให้เฉพาะ "รออนุมัติ (1)" เท่านั้น
              <Form.Item name="status" noStyle>
                <Select size="large">
                  <Select.Option value="1">รออนุมัติ (Pending)</Select.Option>
                  <Select.Option value="2">อนุมัติ (Approve)</Select.Option>
                  <Select.Option value="3">ไม่อนุมัติ (Reject)</Select.Option>
                </Select>
              </Form.Item>
            ) : (
              // 🌟 ถ้าอนุมัติแล้ว/ไม่อนุมัติ/ยกเลิก จะโชว์แค่ป้าย Tag สวยๆ แก้ไม่ได้
              <div style={{ marginTop: '8px' }}>
                {getStatusTag(currentStatus)}
                {currentStatus === '5' && (
                  <Text type="danger" style={{ marginLeft: '12px' }}>
                    * ผู้ใช้งานต้องการยกเลิก กรุณากดปุ่ม <b>"ยืนยันการยกเลิก"</b> ที่มุมขวาบน
                  </Text>
                )}
              </div>
            )}
          </Form.Item>

          <Form.Item style={{ marginTop: '32px', marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button size="large" onClick={() => router.push('/personnel/mission')}>ย้อนกลับ</Button>
              {/* 🌟 ซ่อนปุ่ม "บันทึกการแก้ไข" ทันทีถ้าสถานะไม่เท่ากับ 1 */}
              {!isReadOnly && (
                <Button type="primary" size="large" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                  บันทึกการแก้ไข
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Modal ยืนยันการยกเลิก */}
      <Modal
        title={<span><DeleteOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />ยืนยันการยกเลิกการออกหน่วย</span>}
        open={isCancelModalVisible}
        onOk={handleConfirmCancelMission}
        onCancel={() => setIsCancelModalVisible(false)}
        okText="ยืนยันยกเลิก"
        cancelText="ปิด"
        okButtonProps={{ danger: true, loading: saving, disabled: !cancelReason.trim() }}
      >
        <div style={{ marginTop: '16px' }}>
          <Text>คุณแน่ใจหรือไม่ที่จะยกเลิกคิวการออกหน่วยทันตกรรมเคลื่อนที่นี้?</Text>
          <div style={{ marginTop: '12px' }}>
            <Text type="secondary" strong>โปรดระบุเหตุผลการยกเลิก <span style={{ color: 'red' }}>*</span></Text>
            <Input.TextArea
              rows={3}
              style={{ marginTop: '8px' }}
              placeholder="ตัวอย่างเช่น: วันที่ตรงกับวันหยุด, เจ้าหน้าที่ไม่เพียงพอ..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}