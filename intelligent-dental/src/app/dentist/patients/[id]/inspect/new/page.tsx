"use client";

import { 
  Form, DatePicker, Input, Select, Button, Card, 
  Typography, Space, Row, Col, message, Divider 
} from "antd";
import { 
  ArrowLeftOutlined, SaveOutlined, HistoryOutlined, 
  CheckCircleOutlined 
} from "@ant-design/icons";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { withAuthHeaders } from "@/app/utils/auth.client";
import dayjs from "dayjs";
import React from "react";

const { Title, Text } = Typography;

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'รอนัดหมาย (Scheduled)' },
  { value: 'done', label: 'เสร็จสิ้น (Done)' },
  { value: 'cancelled', label: 'ยกเลิก (Cancelled)' },
  { value: 'request_cancel', label: 'ขอเปิดยกเลิก (Request Cancel)' },
];

export default function NewInspectionPage() {
  const router = useRouter();
  const params = useParams(); // รับ patient id จาก URL /patients/[id]/...
  const [form] = Form.useForm();
  const searchParams = useSearchParams();

  // รับ appointment_id จาก query string ถ้ามี
  React.useEffect(() => {
    const appointmentId = searchParams.get('appointment_id');
    if (appointmentId) {
      form.setFieldsValue({ appointment_id: Number(appointmentId) });
    }
  }, [searchParams, form]);
  const onFinish = async (values: any) => {
    const payload = {
      ...values,
      patient_id: Number(params.id),
      date: values.date.format("YYYY-MM-DD"),
    };
    // สมมุติรับ appointment_id จาก form (หรือ query)
    const appointmentId = values.appointment_id;
    message.loading({ content: 'กำลังบันทึกข้อมูลการตรวจ...', key: 'save_inspect' });

    try {
      const res = await fetch('/api/inspection_records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...withAuthHeaders() },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Save failed');
      const j = await res.json();
      console.log('inspection record response:', j);

      // ถ้ามี appointment_id ให้ PATCH appointment เพื่อเชื่อม inspection_record_id
      const inspectionId = j?.data?.id;
      if (appointmentId && inspectionId) {
        await fetch(`/api/appointments/${appointmentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...withAuthHeaders() },
          body: JSON.stringify({ inspection_record_id: inspectionId })
        });
      }

      message.success({ content: 'เพิ่มบันทึกการตรวจสำเร็จ', key: 'save_inspect' });
      router.push(`/dentist/appointment?inspection_record_id=${inspectionId}`);
    } catch (err) {
      console.error('Save error', err);
      message.error({ content: 'ไม่สามารถบันทึกข้อมูลได้', key: 'save_inspect' });
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* ส่วนหัวหน้าจอ */}
      <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} style={{ marginBottom: 16 }}>ย้อนกลับ</Button>

      <Card 
        variant={"outlined"} 
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '16px' }}
      >
        <div style={{ marginBottom: 32 }}>
          <Title level={3}>
            <HistoryOutlined style={{ color: '#1890ff', marginRight: 10 }} />
            เพิ่มบันทึกการตรวจ
          </Title>
        </div>

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish}
          initialValues={{ 
            date: dayjs(), 
            status: 'completed',
            appointment_id: searchParams.get('appointment_id') ? Number(searchParams.get('appointment_id')) : undefined
          }}
        >
          {/* Hidden field สำหรับ appointment_id */}
          <Form.Item name="appointment_id" style={{ display: 'none' }}>
            <Input type="hidden" />
          </Form.Item>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item 
                name="date" 
                label="วันที่ทำการตรวจ" 
                rules={[{ required: true, message: 'กรุณาเลือกวันที่ตรวจ' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  size="large" 
                  format="YYYY-MM-DD" 
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item 
                name="status" 
                label="สถานะการบันทึก" 
                initialValue="completed"
                hidden
              >
                <Input type="hidden" />
              </Form.Item>
              <div style={{ marginTop: 32 }}>
                <Text strong>สถานะการบันทึก: <span style={{ color: '#52c41a' }}>เสร็จสิ้น (Completed)</span></Text>
              </div>
            </Col>
          </Row>

          <Divider />

          <Form.Item 
            name="history" 
            label="รายละเอียด/ผลการตรวจร่างกาย" 
            rules={[{ required: true, message: 'กรุณาระบุรายละเอียดการตรวจ' }]}
          >
            <Input.TextArea 
              rows={6} 
              placeholder="กรอกข้อมูลที่ได้จากการซักประวัติหรือการตรวจ..." 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <div style={{ marginTop: 40, textAlign: 'right' }}>
            <Space size="middle">
              <Button size="large" onClick={() => router.back()}>
                ยกเลิก
              </Button>
              <Button 
                type="primary" 
                size="large" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                style={{ minWidth: '150px', borderRadius: '8px' }}
              >
                บันทึกประวัติการตรวจ
              </Button>
            </Space>
          </div>
        </Form>
      </Card>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Text type="secondary" italic>
          ID ผู้ป่วยปัจจุบัน: {params.id}
        </Text>
      </div>
    </div>
  );
}