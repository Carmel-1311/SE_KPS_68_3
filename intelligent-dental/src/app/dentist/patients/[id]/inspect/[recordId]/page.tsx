"use client";

import { useEffect } from "react";
import { Form, DatePicker, Input, Select, Button, Card, Typography, Space, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined, HistoryOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { withAuthHeaders } from "@/app/utils/auth.client";
import dayjs from "dayjs";

const { Title } = Typography;

export default function EditInspectionPage() {
  const router = useRouter();
  const params = useParams();
  const [form] = Form.useForm();

  useEffect(() => {
    // fetch existing record to prefill
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/inspection_records/${params.recordId}`, { headers: withAuthHeaders() })
        if (!res.ok) throw new Error('Not found')
        const j = await res.json()
        const data = j.data || j
        form.setFieldsValue({
          date: data.date ? dayjs(data.date) : undefined,
          history: data.history,
          status: data.status,
        })
      } catch (err) {
        console.error('fetch record error', err)
        message.error('ไม่สามารถโหลดข้อมูลบันทึกได้')
      }
    }
    fetchData()
  }, [params.recordId, form]);

  const onFinish = (values: any) => {
    const payload = { ...values, date: values.date.format("YYYY-MM-DD") };
    fetch(`/api/inspection_records/${params.recordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...withAuthHeaders() },
      body: JSON.stringify(payload)
    }).then(async res => {
      if (!res.ok) throw new Error('Update failed')
      message.success('อัปเดตประวัติการตรวจสำเร็จ')
      router.back()
    }).catch(err => {
      console.error('update error', err)
      message.error('ไม่สามารถอัปเดตข้อมูลได้')
    })
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
            <Select
              options={[
                { value: 'scheduled', label: 'รอนัดหมาย (Scheduled)' },
                { value: 'completed', label: 'เสร็จสิ้น (Completed)' },
                { value: 'cancelled', label: 'ยกเลิก (Cancelled)' },
                { value: 'request_cancel', label: 'ขอเปิดยกเลิก (Request Cancel)' },
              ]}
            />
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