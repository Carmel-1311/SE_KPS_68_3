"use client";

import { useEffect } from "react";
import { Form, DatePicker, Input, Select, Button, Card, Typography, Space, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined, HistoryOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";

const { Title } = Typography;

export default function EditInspectionPage() {
  const router = useRouter();
  const params = useParams();
  const [form] = Form.useForm();

  useEffect(() => {
    // ในสถานการณ์จริง คุณจะ fetch ข้อมูลจาก API โดยใช้ params.recordId
    // อันนี้คือการจำลองดึงข้อมูลเดิมมาใส่ (Prefill)
    form.setFieldsValue({
      date: dayjs("2024-03-01"),
      history: "ตรวจสุขภาพประจำปี ความดันปกติ (ข้อมูลเดิมจากระบบ)",
      status: "completed",
    });
  }, [params.recordId, form]);

  const onFinish = (values: any) => {
    const payload = { ...values, id: params.recordId, date: values.date.format("YYYY-MM-DD") };
    console.log("Updating Inspection:", payload);
    message.success("อัปเดตประวัติการตรวจสำเร็จ");
    router.back();
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} style={{ marginBottom: 16 }}>ย้อนกลับ</Button>
      <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
        <Title level={3}><HistoryOutlined /> แก้ไขบันทึกการตรวจ</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="date" label="วันที่ตรวจ" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" /></Form.Item>
          <Form.Item name="history" label="รายละเอียดการตรวจ" rules={[{ required: true }]}><Input.TextArea rows={5} /></Form.Item>
          <Form.Item name="status" label="สถานะ" rules={[{ required: true }]}>
            <Select options={[{ value: 'scheduled', label: 'รอนัดหมาย' }, { value: 'completed', label: 'เสร็จสิ้น' }]} />
          </Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => router.back()}>ยกเลิก</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>บันทึกการแก้ไข</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}