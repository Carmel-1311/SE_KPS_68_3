"use client";

import React from 'react';
import { Table, Tag, Space, Card, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface ScheduleDataType {
  key: string;
  time: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
}

const columns: ColumnsType<ScheduleDataType> = [
  { title: 'เวลา', dataIndex: 'time', key: 'time', width: 100, fixed: 'left' },
  { title: 'จันทร์', dataIndex: 'monday', key: 'monday', render: (text) => <ScheduleItem task={text} /> },
  { title: 'อังคาร', dataIndex: 'tuesday', key: 'tuesday', render: (text) => <ScheduleItem task={text} /> },
  { title: 'พุธ', dataIndex: 'wednesday', key: 'wednesday', render: (text) => <ScheduleItem task={text} /> },
  { title: 'พฤหัสบดี', dataIndex: 'thursday', key: 'thursday', render: (text) => <ScheduleItem task={text} /> },
  { title: 'ศุกร์', dataIndex: 'friday', key: 'friday', render: (text) => <ScheduleItem task={text} /> },
];

// คอมโพเนนต์ย่อยสำหรับแสดงตารางนัดหมาย
const ScheduleItem = ({ task }: { task: string }) => {
  if (!task) return null;
  return (
    <Tag color="blue" style={{ width: '100%', marginBottom: 4 }}>
      {task}
    </Tag>
  );
};

const dataSource: ScheduleDataType[] = [
  { key: '1', time: '09:00 - 10:00', monday: 'ตรวจฟัน (Case A)', tuesday: '', wednesday: 'อุดฟัน (Case B)', thursday: '', friday: 'ตรวจสุขภาพ' },
  { key: '2', time: '10:00 - 11:00', monday: '', tuesday: 'ขูดหินปูน', wednesday: '', thursday: 'ผ่าฟันคุด', friday: '' },
  // เพิ่มข้อมูลตามต้องการ
];

export default function WorkSchedulePage() {
  return (
    <Card title="ตารางทำงานทันตแพทย์" extra={<Button type="primary">เพิ่มนัดหมาย</Button>}>
      <Table 
        columns={columns} 
        dataSource={dataSource} 
        pagination={false} 
        bordered 
        scroll={{ x: 800 }}
      />
    </Card>
  );
}