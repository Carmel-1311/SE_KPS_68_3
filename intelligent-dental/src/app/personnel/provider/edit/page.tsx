"use client";

import { Button, Card, Form, Input } from "antd";

export default function ProviderEditPage() {
  return (
    <Card title="19 แก้ไข/ลบข้อมูลผู้ใช้">
      <Form layout="vertical" style={{ maxWidth: 520 }}>
        <Form.Item label="ชื่อ"><Input defaultValue="สมชาย" /></Form.Item>
        <Form.Item label="นามสกุล"><Input defaultValue="ใจดี" /></Form.Item>
        <Form.Item label="เบอร์โทร"><Input defaultValue="0812345678" /></Form.Item>
        <Button type="primary">บันทึก</Button>
      </Form>
    </Card>
  );
}

