'use client';

import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Input, Form, Select, message, Spin, Space, Modal, Breadcrumb, Divider } from 'antd';
import { SaveOutlined, DeleteOutlined, HomeOutlined, EditOutlined, CalendarOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';

const { Title, Text } = Typography;

// 🌟 Mock Database (โครงสร้างเดียวกับหน้า Create)
const patientMockDB: Record<number, { first_name: string, last_name: string }> = {
  101: { first_name: 'สมชาย', last_name: 'ใจดี' },
  102: { first_name: 'สมหญิง', last_name: 'รักสวย' },
  103: { first_name: 'มานะ', last_name: 'อดทน' }
};

const dentistMockDB: Record<number, { first_name: string, last_name: string }> = {
  5: { first_name: 'สมเกียรติ', last_name: 'รักดี' },
  6: { first_name: 'นภา', last_name: 'แจ่มใส' }
};

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params.id as string;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [displayNames, setDisplayNames] = useState({ patient: '', dentist: '' });
  const [displayId, setDisplayId] = useState<number | string>('');
  
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // 🌟 State สำหรับจัดการ Modal ยกเลิกและเหตุผล
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && form && idParam) {
      fetchAppointmentDetail();
    }
  }, [isMounted, idParam, form]);

  const fetchAppointmentDetail = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      const storedData = localStorage.getItem('appointment_schedule');
      if (!storedData || !form) {
        setLoading(false);
        return;
      }

      const appointments = JSON.parse(storedData);
      const activeAppointments = appointments.filter((item: any) => !item.is_deleted);
      const targetIndex = activeAppointments.findIndex((item: any) => item.appointment_id === Number(idParam));
      const targetAppointment = activeAppointments[targetIndex];
      
      if (targetAppointment) {
        setDisplayId(targetAppointment.appointment_id);

        const pId = targetAppointment.patient?.patient_id || '';
        const dId = targetAppointment.dentist?.dentist_id || '';

        setDisplayNames({
          patient: targetAppointment.patient ? `${targetAppointment.patient.first_name} ${targetAppointment.patient.last_name}` : `คนไข้รหัส ${pId}`,
          dentist: targetAppointment.dentist ? `ทพ./ทพญ. ${targetAppointment.dentist.first_name} ${targetAppointment.dentist.last_name}` : `แพทย์รหัส ${dId}`
        });

        setCurrentStatus(targetAppointment.status);

        form.setFieldsValue({
          patient_id: pId ? String(pId) : '',
          dentist_id: dId ? String(dId) : '', 
          appointment_date: targetAppointment.appointment_date,
          appointment_time: targetAppointment.appointment_time,
          type: targetAppointment.type, 
          status: targetAppointment.status
        });

        fetchAvailableSlots(targetAppointment.appointment_date, dId);
      } else {
        message.error('ไม่พบข้อมูลการนัดหมายนี้');
        router.push('/personnel/appointment-schedule');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      message.error('ดึงข้อมูลล้มเหลว');
      setLoading(false);
      router.push('/personnel/appointment-schedule');
    }
  };

  const fetchAvailableSlots = (date: string, dentistId: string | number) => {
    if (!date || !dentistId) return;
    setLoadingSlots(true);
    
    setTimeout(() => {
      const mockSlots = [
        '09:00:00', '09:30:00', '10:00:00', '10:30:00', 
        '11:00:00', '13:00:00', '13:30:00', '14:00:00', 
        '14:30:00', '15:00:00', '15:30:00', '16:00:00'
      ];
      const randomAvailable = mockSlots.filter(() => Math.random() > 0.1);
      
      const currentTime = form.getFieldValue('appointment_time');
      if (currentTime && !randomAvailable.includes(currentTime)) {
        randomAvailable.push(currentTime);
        randomAvailable.sort(); 
      }

      setAvailableSlots(randomAvailable);
      setLoadingSlots(false);
    }, 400);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const dentistId = form.getFieldValue('dentist_id');
    form.setFieldsValue({ appointment_time: undefined }); 
    fetchAvailableSlots(newDate, dentistId);
  };

  const handleUpdate = async (values: any) => {
    setSaving(true);
    try {
      setTimeout(() => {
        const storedData = localStorage.getItem('appointment_schedule');
        if (storedData) {
          let appointments = JSON.parse(storedData);
          const index = appointments.findIndex((item: any) => item.appointment_id === Number(idParam));
          
          if (index !== -1) {
             appointments[index] = {
              ...appointments[index], 
              appointment_date: values.appointment_date,
              appointment_time: values.appointment_time,
              type: values.type, 
              status: values.status
            };

            localStorage.setItem('appointment_schedule', JSON.stringify(appointments));
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

  // 🌟 ฟังก์ชันจัดการเมื่อกดยืนยันใน Modal ยกเลิก
  const handleConfirmDelete = async () => {
    if (!cancelReason.trim()) {
      message.warning('กรุณาระบุเหตุผลการยกเลิก');
      return;
    }

    try {
      setTimeout(() => {
        const storedData = localStorage.getItem('appointment_schedule');
        if (storedData) {
          let appointments = JSON.parse(storedData);
          const index = appointments.findIndex((item: any) => item.appointment_id === Number(idParam));
          
          if (index !== -1) {
            appointments[index] = {
              ...appointments[index],
              is_deleted: true,
              status: 'cancelled',
              cancel_reason: cancelReason // 🌟 บันทึกเหตุผลการยกเลิกลงไปด้วย
            };
            localStorage.setItem('appointment_schedule', JSON.stringify(appointments));
          }
        }
        message.success('ยกเลิกการนัดหมายเรียบร้อยแล้ว');
        setIsCancelModalVisible(false);
        router.push('/personnel/appointment-schedule');
      }, 400);
    } catch (error) {
      message.error('ยกเลิกการนัดหมายไม่สำเร็จ');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  }

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

      <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ marginBottom: '4px' }}>แก้ไขการนัดหมาย (รหัส: {displayId})</Title>
            <Text type="secondary">ปรับปรุงข้อมูลหรือสถานะของการนัดหมายนี้</Text>
          </div>
          
          {/* 🌟 เปลี่ยนจาก Popconfirm เป็นปุ่มธรรมดาที่กดแล้วเปิด Modal แทน */}
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            disabled={currentStatus === 'cancelled'}
            onClick={() => setIsCancelModalVisible(true)}
          >
            ยกเลิกการนัดหมาย
          </Button>
        </div>

        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Form.Item name="patient_id" label="รหัสคนไข้ (Patient ID)" style={{ flex: 1, minWidth: '250px' }}>
              <Input size="large" disabled addonAfter={`- ${displayNames.patient}`} />
            </Form.Item>

            <Form.Item name="dentist_id" label="ทันตแพทย์" style={{ flex: 1, minWidth: '250px' }}>
              <Input size="large" disabled addonAfter={`- ${displayNames.dentist}`} />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Form.Item name="appointment_date" label="วันที่นัด" style={{ flex: 1, minWidth: '250px' }} rules={[{ required: true }]}>
              <Input type="date" size="large" onChange={handleDateChange} />
            </Form.Item>

            <Form.Item name="appointment_time" label="เวลา (ดึงจากเวลาที่แพทย์ว่าง)" style={{ flex: 1, minWidth: '250px' }} rules={[{ required: true, message: 'กรุณาเลือกเวลา' }]}>
               <Select size="large" placeholder="เลือกเวลา" loading={loadingSlots} disabled={loadingSlots}>
                {availableSlots.map((time) => (
                  <Select.Option key={time} value={time}>
                    {time.slice(0, 5)} น.
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="type" label="บริการ/การรักษา (Type)" rules={[{ required: true }]}>
            <Input.TextArea rows={3} size="large" />
          </Form.Item>

          <Divider />

          <Form.Item name="status" label="สถานะ (Status)">
            <Select size="large">
              <Select.Option value="scheduled">รอดำเนินการ (Scheduled)</Select.Option>
              <Select.Option value="completed">เสร็จสิ้น (Completed)</Select.Option>
              
              {currentStatus === 'request_cancel' && (
                <Select.Option value="request_cancel">
                   ส่งคำขอยกเลิกแล้ว (Request Cancel)
                </Select.Option>
              )}
              
              <Select.Option value="cancelled">
                ยกเลิกการนัดหมาย (Cancelled) 
                {currentStatus === 'request_cancel' && " - ยืนยันคำขอยกเลิกจากผู้ป่วย"}
              </Select.Option>
            </Select>
            {currentStatus === 'request_cancel' && (
              <Text type="warning" style={{ marginTop: '8px', display: 'block' }}>
                * ผู้ป่วยส่งคำขอยกเลิกมา กรุณาเปลี่ยนสถานะเป็น "ยกเลิกการนัดหมาย" เพื่อยืนยัน
              </Text>
            )}
          </Form.Item>

          <Form.Item style={{ marginTop: '32px', marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button size="large" onClick={() => router.push('/personnel/appointment-schedule')}>ย้อนกลับ</Button>
              <Button type="primary" size="large" htmlType="submit" icon={<SaveOutlined />} loading={saving}>บันทึกการแก้ไข</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 🌟 Modal สำหรับกรอกเหตุผลการยกเลิก */}
      <Modal
        title={<span><DeleteOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />ยืนยันการยกเลิกนัดหมาย</span>}
        open={isCancelModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => {
          setIsCancelModalVisible(false);
          setCancelReason(''); // เคลียร์ข้อความเมื่อปิด
        }}
        okText="ยืนยันยกเลิก"
        cancelText="ปิด"
        okButtonProps={{ danger: true, disabled: !cancelReason.trim() }} // บังคับว่าต้องพิมพ์เหตุผลถึงจะกดได้
      >
        <div style={{ marginTop: '16px' }}>
          <Text>คุณแน่ใจหรือไม่ที่จะยกเลิกการนัดหมายนี้? กรุณาระบุเหตุผลด้านล่าง:</Text>
          <Input.TextArea
            rows={4}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="ตัวอย่างเช่น: คนไข้ไม่สะดวกมาตามนัด, หมอติดธุระด่วน..."
            style={{ marginTop: '12px' }}
          />
        </div>
      </Modal>

    </div>
  );
}