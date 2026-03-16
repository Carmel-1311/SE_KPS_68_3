"use client";

import { 
  Form, DatePicker, Input, Select, Button, Card, 
  Typography, Space, Divider, Row, Col, message 
} from "antd";
import { 
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, 
  MinusCircleOutlined, MedicineBoxOutlined 
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

export default function NewMedicalRecordPage() {
  const router = useRouter();
  const params = useParams(); // รับ patient id จาก URL
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    // รวมข้อมูลและจัดการ format วันที่ก่อนส่ง API
    const payload = {
      ...values,
      patient_id: params.id,
      date: values.date.format("YYYY-MM-DD"),
    };

    console.log("Saving Medical Record:", payload);
    
    // จำลองการบันทึกข้อมูล
    message.loading({ content: 'กำลังบันทึกข้อมูล...', key: 'save_md' });
    
    setTimeout(() => {
      message.success({ content: 'เพิ่มประวัติการรักษาสำเร็จ', key: 'save_md' });
      router.back(); // กลับไปหน้าแฟ้มประวัติคนไข้
    }, 1000);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Navigation Header */}
      <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} style={{ marginBottom: 16 }}>ย้อนกลับ</Button>

      <Card 
        bordered={false} 
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px' }}
      >
        <div style={{ marginBottom: 24 }}>
          <Title level={3}>
            <MedicineBoxOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            เพิ่มบันทึกการรักษาใหม่
          </Title>
          <Text type="secondary">กรอกรายละเอียดการวินิจฉัยและแผนการรักษาสำหรับคนไข้ ID: {params.id}</Text>
        </div>

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish}
          initialValues={{ 
            date: dayjs(), 
            status: 'completed',
            detail: [{ type_id: '', diagnosis: '' }] // ค่าเริ่มต้นสำหรับรายการวินิจฉัย 1 รายการ
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="date" 
                label="วันที่รับการรักษา" 
                rules={[{ required: true, message: 'กรุณาระบุวันที่' }]}
              >
                <DatePicker style={{ width: '100%' }} size="large" format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="status" 
                label="สถานะการรักษา" 
                rules={[{ required: true, message: 'กรุณาระบุสถานะ' }]}
              >
                <Select size="large" options={STATUS_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="history" 
            label="อาการสำคัญ / ประวัติการรักษา" 
            rules={[{ required: true, message: 'กรุณากรอกประวัติการรักษา' }]}
          >
            <Input.TextArea rows={4} placeholder="ระบุอาการของผู้ป่วยและการรักษาเบื้องต้น..." />
          </Form.Item>

          <Divider orientation="horizontal">
            <Text strong>รายละเอียดการวินิจฉัย (Diagnosis Details)</Text>
          </Divider>

          <Form.List name="detail">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    type="inner" 
                    style={{ marginBottom: 16, background: '#fafafa' }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <Row gutter={16} align="middle">
                      <Col xs={24} sm={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'type_id']}
                          label="รหัสประเภท"
                          rules={[{ required: true, message: 'ระบุ ID' }]}
                        >
                          <Input placeholder="เช่น 001" />
                        </Form.Item>
                      </Col>
                      <Col xs={20} sm={15}>
                        <Form.Item
                          {...restField}
                          name={[name, 'diagnosis']}
                          label="ผลวินิจฉัย"
                          rules={[{ required: true, message: 'กรุณากรอกผลวินิจฉัย' }]}
                        >
                          <Input placeholder="ระบุชื่อโรคหรือผลการวินิจฉัย" />
                        </Form.Item>
                      </Col>
                      <Col xs={4} sm={3} style={{ textAlign: 'center', marginTop: 8 }}>
                        {fields.length > 1 && (
                          <Button 
                            type="text" 
                            danger 
                            icon={<MinusCircleOutlined />} 
                            onClick={() => remove(name)} 
                          />
                        )}
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button 
                  type="dashed" 
                  onClick={() => add()} 
                  block 
                  icon={<PlusOutlined />}
                  style={{ height: '45px' }}
                >
                  เพิ่มรายการวินิจฉัย
                </Button>
              </>
            )}
          </Form.List>

          <Divider />

          <Row justify="end" gutter={12}>
            <Col>
              <Button size="large" onClick={() => router.back()}>
                ยกเลิก
              </Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                size="large" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                บันทึกประวัติการรักษา
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}