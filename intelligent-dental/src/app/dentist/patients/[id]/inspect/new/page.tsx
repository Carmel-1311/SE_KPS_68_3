"use client";

import { 
  Form, DatePicker, Input, Select, Button, Card, 
  Typography, Space, Row, Col, message, Divider 
} from "antd";
import { 
  ArrowLeftOutlined, SaveOutlined, HistoryOutlined, 
  CheckCircleOutlined 
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'รอนัดหมาย (Scheduled)' },
  { value: 'completed', label: 'เสร็จสิ้น (Completed)' },
  { value: 'cancelled', label: 'ยกเลิก (Cancelled)' },
  { value: 'request_cancel', label: 'ขอเปิดยกเลิก (Request Cancel)' },
];

export default function NewInspectionPage() {
  const router = useRouter();
  const params = useParams(); // รับ patient id จาก URL /patients/[id]/...
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    const payload = {
      ...values,
      patient_id: params.id,
      date: values.date.format("YYYY-MM-DD"),
    };

    console.log("Saving Inspection Record:", payload);
    
    message.loading({ content: 'กำลังบันทึกข้อมูลการตรวจ...', key: 'save_inspect' });
    
    // จำลองการเชื่อมต่อ API
    setTimeout(() => {
      message.success({ content: 'เพิ่มบันทึกการตรวจสำเร็จ', key: 'save_inspect' });
      router.back();
    }, 800);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* ส่วนหัวหน้าจอ */}
      <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} style={{ marginBottom: 16 }}>ย้อนกลับ</Button>

      <Card 
        bordered={false} 
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '16px' }}
      >
        <div style={{ marginBottom: 32 }}>
          <Title level={3}>
            <HistoryOutlined style={{ color: '#1890ff', marginRight: 10 }} />
            เพิ่มบันทึกการตรวจ (Inspection)
          </Title>
          <Text type="secondary">บันทึกข้อมูลการคัดกรอง หรือผลการตรวจร่างกายเบื้องต้นของคนไข้</Text>
        </div>

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish}
          initialValues={{ 
            date: dayjs(), 
            status: 'completed' 
          }}
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
                rules={[{ required: true }]}
              >
                <Select size="large" options={STATUS_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item 
            name="history" 
            label="รายละเอียด/ผลการตรวจร่างกาย" 
            rules={[{ required: true, message: 'กรุณาระบุรายละเอียดการตรวจ' }]}
            extra="ตัวอย่าง: ตรวจสุขภาพประจำปี ความดันปกติ, มีไข้สูง 38 องศา"
          >
            <Input.TextArea 
              rows={6} 
              placeholder="กรอกข้อมูลที่ได้จากการซักประวัติหรือการตรวจร่างกาย..." 
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
                icon={<CheckCircleOutlined />}
                style={{ minWidth: '150px', borderRadius: '8px' }}
              >
                บันทึกข้อมูล
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