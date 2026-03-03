"use client";

import { Card, Descriptions } from "antd";

export default function ProviderDetailPage() {
  return (
    <Card title="11 ข้อมูลผู้ใช้">
      <Descriptions bordered column={1}>
        <Descriptions.Item label="ชื่อ">สมชาย ใจดี</Descriptions.Item>
        <Descriptions.Item label="เบอร์โทร">0812345678</Descriptions.Item>
        <Descriptions.Item label="อีเมล">somchai@example.com</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

