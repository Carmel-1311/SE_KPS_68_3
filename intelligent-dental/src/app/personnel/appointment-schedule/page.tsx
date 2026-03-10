'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography, Button, Input, DatePicker, Space, Tooltip, message, Breadcrumb } from 'antd';
import { SearchOutlined, PlusOutlined, ReadOutlined, HomeOutlined, CalendarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface AppointmentType {
  id: number;
  patient_id: number;
  patient_name: string;
  staff_id: number;
  staff_name: string;
  appointment_date: string;
  appointment_time: string;
  treatment: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  is_deleted?: boolean; 
}

export default function AppointmentListPage() {
  const router = useRouter(); 
  const [data, setData] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        const mockData: AppointmentType[] = [
          { 
            id: 1, 
            patient_id: 101, 
            patient_name: 'สมชาย ใจดี', 
            staff_id: 5, 
            staff_name: 'ทพ. สมเกียรติ', 
            appointment_date: '2026-03-15', 
            appointment_time: '09:00:00', 
            treatment: 'ขูดหินปูน', 
            status: 'scheduled' 
          },
          { 
            id: 2, 
            patient_id: 102, 
            patient_name: 'สมหญิง รักสวย', 
            staff_id: 6, 
            staff_name: 'ทพญ. นภา', 
            appointment_date: '2026-03-15', 
            appointment_time: '10:30:00', 
            treatment: 'อุดฟัน', 
            status: 'scheduled' 
          }
        ];
        
        const storedData = localStorage.getItem('appointments');
        let appointments = [];
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          appointments = parsedData.filter((item: AppointmentType) => !item.is_deleted);
        } else {
          appointments = mockData;
          localStorage.setItem('appointments', JSON.stringify(mockData));
        }
        
        setData(appointments);
        setLoading(false);
      }, 500);
    } catch (error) {
      message.error('โหลดข้อมูลล้มเหลว');
      setLoading(false);
    }
  };

  const filteredData = data.filter((item) => {
    const matchName = item.patient_name.toLowerCase().includes(searchText.toLowerCase());
    const matchDate = selectedDate ? item.appointment_date === selectedDate : true;
    return matchName && matchDate;
  });

  const columns: ColumnsType<AppointmentType> = [
    // 🌟 เปลี่ยนจากดึง dataIndex: 'id' เป็นการรันเลขลำดับ (Index) 1, 2, 3...
    { 
      title: 'ลำดับ', 
      key: 'index', 
      width: 70,
      align: 'center',
      render: (text, record, index) => <Text strong>{index + 1}</Text> 
    },
    {
      title: 'วันและเวลา',
      key: 'datetime',
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text>{record.appointment_date}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.appointment_time}</Text>
        </div>
      ),
    },
    { title: 'ชื่อคนไข้', dataIndex: 'patient_name', key: 'patient_name' },
    { title: 'บริการ/การรักษา', dataIndex: 'treatment', key: 'treatment' },
    { title: 'ทันตแพทย์', dataIndex: 'staff_name', key: 'staff_name' },
    {
      title: 'สถานะ',
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => {
        let color = 'blue'; let text = 'รอดำเนินการ';
        if (status === 'scheduled') { color = 'blue'; text = 'รอดำเนินการ'; } 
        else if (status === 'completed') { color = 'green'; text = 'เสร็จสิ้น'; } 
        else if (status === 'cancelled') { color = 'red'; text = 'ยกเลิก'; }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Detail" placement="top">
            {/* 🌟 ลิงก์ยังคงอ้างอิงจาก record.id (ค่าจริงในระบบ) ไม่ใช่เลขลำดับ */}
            <Link href={`/personnel/appointment-schedule/${record.id}`}>
              <Button 
                type="text" 
                icon={<ReadOutlined style={{ fontSize: '20px', color: '#333' }} />} 
                style={{ padding: 0 }} 
              />
            </Link>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      
      <Breadcrumb
        style={{ marginBottom: '24px', fontSize: '15px' }}
        items={[
          { title: <a onClick={() => router.push('/')}><HomeOutlined /> หน้าหลัก</a> },
          { title: <span><CalendarOutlined /> ตารางการนัดหมาย</span> },
        ]}
      />

      <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>ตารางการนัดหมาย</Title>
            <Text type="secondary">จัดการและตรวจสอบคิวการนัดหมายของคลินิก</Text>
          </div>
          <Link href="/personnel/appointment-schedule/create">
            <Button type="primary" size="large" icon={<PlusOutlined />} style={{ borderRadius: '8px' }}>
              เพิ่มการนัดหมาย
            </Button>
          </Link>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '16px' }}>
          <Input 
            placeholder="ค้นหาชื่อคนไข้..." 
            prefix={<SearchOutlined />} 
            value={searchText} 
            onChange={(e) => setSearchText(e.target.value)} 
            style={{ width: 300, borderRadius: '8px' }} 
            allowClear 
          />
          <DatePicker placeholder="เลือกวันที่" style={{ borderRadius: '8px' }} onChange={(_, dateString) => setSelectedDate(Array.isArray(dateString) ? dateString[0] : dateString)} />
        </div>

        <Table columns={columns} dataSource={filteredData} rowKey="id" pagination={{ pageSize: 5 }} loading={loading} />
      </Card>
    </div>
  );
}