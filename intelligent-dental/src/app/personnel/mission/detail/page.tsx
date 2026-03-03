"use client";

import { Button, Card, DatePicker, Form, Input } from "antd";

export default function PersonnelMissionDetailPage() {
  return (
    <Card title="18 ดูรายละเอียด / แก้ไขการออกหน่วย">
      <Form layout="vertical" style={{ maxWidth: 620 }}>
        <Form.Item label="วันที่"><DatePicker style={{ width: "100%" }} /></Form.Item>
        <Form.Item label="สถานที่"><Input /></Form.Item>
        <Button type="primary">อัปเดต</Button>
      </Form>
    </Card>
  );
}

