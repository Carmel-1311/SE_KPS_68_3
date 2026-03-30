"use client";

import { useEffect, useState } from "react";
import { 
  Form, DatePicker, Input, Select, Button, Card, 
  Typography, Space, Row, Col, message, Divider 
} from "antd";
import { 
  ArrowLeftOutlined, SaveOutlined, HistoryOutlined, 
  EditOutlined 
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { withAuthHeaders } from "@/app/utils/auth.client";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function EditInspectionPage() {
  const router = useRouter();
  const params = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/inspection_records/${params.recordId}`, { 
          headers: withAuthHeaders() 
        });
        if (!res.ok) throw new Error('Not found');
        const j = await res.json();
        const data = j.data || j;
        
        form.setFieldsValue({
          date: data.date ? dayjs(data.date) : undefined,
          history: data.history,
          status: data.status,
        });
      } catch (err) {
        console.error('fetch record error', err);
        message.error('ไม่สามารถโหลดข้อมูลบันทึกได้');
      }
    };
    fetchData();
  }, [params.recordId, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    const payload = { 
      ...values, 
      date: values.date.format("YYYY-MM-DD") 
    };

    try {
      const res = await fetch(`/api/inspection_records/${params.recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...withAuthHeaders() },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Update failed');
      
      message.success('อัปเดตประวัติการตรวจสำเร็จ');
      router.back();
    } catch (err) {
      console.error('update error', err);
      message.error('ไม่สามารถอัปเดตข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* ส่วนหัวหน้าจอ */}
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => router.back()} 
        style={{ marginBottom: 16 }}
      >
        ย้อนกลับ
      </Button>

      <Card 
        variant={"outlined"} 
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '16px' }}
      >
        <div style={{ marginBottom: 32 }}>
          <Title level={3}>
            <HistoryOutlined style={{ color: '#1890ff', marginRight: 10 }} />
            แก้ไขบันทึกการตรวจ
          </Title>
        </div>

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish}
        >
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
                rules={[{ required: true, message: 'กรุณาเลือกสถานะ' }]}
              >
                <Select
                  size="large"
                  options={[
                    { value: 'scheduled', label: 'รอนัดหมาย (Scheduled)' },
                    { value: 'completed', label: 'เสร็จสิ้น (Completed)' },
                    { value: 'cancelled', label: 'ยกเลิก (Cancelled)' },
                    { value: 'request_cancel', label: 'ขอเปิดยกเลิก (Request Cancel)' },
                  ]}
                />
              </Form.Item>
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
                loading={loading}
                style={{ minWidth: '150px', borderRadius: '8px' }}
              >
                บันทึกการแก้ไข
              </Button>
            </Space>
          </div>
        </Form>
      </Card>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Text type="secondary" italic>
          กำลังแก้ไขบันทึก ID: {params.recordId}
        </Text>
      </div>
    </div>
  );
}