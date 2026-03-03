"use client";

import Link from "next/link";
import { Button, Card, Space, Table } from "antd";

const data = [{ key: "1", date: "2026-03-10", shift: "เช้า" }];

export default function DentistWorkSchedulePage() {
  return (
    <Card title="12 ตารางการทำงาน">
      <Space style={{ marginBottom: 12 }}>
        <Link href="/dentist/work-schedule/edit"><Button>20 แก้ไข/ยกเลิกวันเวลาการทำงาน</Button></Link>
        <Link href="/dentist/work-schedule/new"><Button>21 เพิ่มวันเวลาการทำงาน</Button></Link>
      </Space>
      <Table
        pagination={false}
        dataSource={data}
        columns={[
          { title: "วันที่", dataIndex: "date" },
          { title: "ช่วงเวลา", dataIndex: "shift" },
        ]}
      />
    </Card>
  );
}

