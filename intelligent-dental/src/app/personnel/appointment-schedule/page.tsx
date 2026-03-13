'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, Tag, Card, Typography, Button, Input, DatePicker, 
  Space, Tooltip, message, Breadcrumb, Popconfirm, Tabs, Badge, Select 
} from 'antd'; // 🌟 1. นำเข้า Select
import { SearchOutlined, PlusOutlined, ReadOutlined, HomeOutlined, CalendarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface AppointmentScheduleType {
  appointment_id: number;
  appointment_date: string; 
  appointment_time: string; 
  type: string;             
  status: 'scheduled' | 'completed' | 'cancelled' | 'request_cancel';
  
  patient: {
    patient_id: number;
    first_name: string;
    last_name: string;
    phone?: string; 
  };

  dentist: {
    dentist_id: number;
    first_name: string;
    last_name: string;
  };
}

export default function AppointmentListPage() {
  const router = useRouter(); 
  const [data, setData] = useState<AppointmentScheduleType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // 🌟 2. State สำหรับกรองสถานะ
  const [activeTab, setActiveTab] = useState<string>('1'); 

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        const mockData: AppointmentScheduleType[] = [
          { 
            appointment_id: 1001, 
            appointment_date: '2026-03-15', 
            appointment_time: '09:00:00', 
            type: 'ตรวจสุขภาพช่องปากและขูดหินปูน', 
            status: 'scheduled',
            patient: { patient_id: 501, first_name: 'สมชาย', last_name: 'ใจดี', phone: '081-111-1111' },
            dentist: { dentist_id: 5, first_name: 'สมเกียรติ', last_name: 'รักดี' }
          },
          { 
            appointment_id: 1002, 
            appointment_date: '2026-03-15', 
            appointment_time: '09:30:00', 
            type: 'อุดฟัน (ฟันผุ)', 
            status: 'request_cancel', 
            patient: { patient_id: 502, first_name: 'สมหญิง', last_name: 'รักสวย', phone: '082-222-2222' },
            dentist: { dentist_id: 6, first_name: 'นภา', last_name: 'แจ่มใส' }
          },
          { 
            appointment_id: 1003, 
            appointment_date: '2026-03-15', 
            appointment_time: '10:00:00', 
            type: 'ถอนฟันคุด', 
            status: 'scheduled',
            patient: { patient_id: 503, first_name: 'มานะ', last_name: 'อดทน', phone: '083-333-3333' },
            dentist: { dentist_id: 5, first_name: 'สมเกียรติ', last_name: 'รักดี' }
          },
          { 
            appointment_id: 1004, 
            appointment_date: '2026-03-16', 
            appointment_time: '13:00:00', 
            type: 'รักษารากฟัน', 
            status: 'completed', 
            patient: { patient_id: 504, first_name: 'ปิติ', last_name: 'มีสุข', phone: '084-444-4444' },
            dentist: { dentist_id: 6, first_name: 'นภา', last_name: 'แจ่มใส' }
          },
          { 
            appointment_id: 1005, 
            appointment_date: '2026-03-16', 
            appointment_time: '14:30:00', 
            type: 'ทำฟันปลอม', 
            status: 'request_cancel', 
            patient: { patient_id: 505, first_name: 'ชูใจ', last_name: 'ร่าเริง', phone: '085-555-5555' },
            dentist: { dentist_id: 7, first_name: 'ธนา', last_name: 'มั่นคง' }
          }
        ];
        
        const storedData = localStorage.getItem('appointment_schedule');
        let appointments: AppointmentScheduleType[] = storedData ? JSON.parse(storedData) : mockData;

        if (!storedData) {
           localStorage.setItem('appointment_schedule', JSON.stringify(mockData));
        }

        const mockAuthData = localStorage.getItem('auth_data') 
            ? JSON.parse(localStorage.getItem('auth_data') as string)
            : { role: 'staff', account_id: 1 }; 

        if (mockAuthData.role === 'dentist') {
          appointments = appointments.filter((item) => item.dentist.dentist_id === mockAuthData.account_id);
        }

        setData(appointments);
        setLoading(false);
      }, 500);
    } catch (error) {
      message.error('โหลดข้อมูลล้มเหลว');
      setLoading(false);
    }
  };

  const handleConfirmCancel = (appointment_id: number) => {
    const updatedData = data.map(item => 
      item.appointment_id === appointment_id 
        ? { ...item, status: 'cancelled' as const } 
        : item
    );
    
    setData(updatedData);
    localStorage.setItem('appointment_schedule', JSON.stringify(updatedData));
    message.success('ยืนยันการยกเลิกนัดหมายเรียบร้อยแล้ว');
  };

  const requestCancelCount = data.filter(item => item.status === 'request_cancel').length;

  const finalFilteredData = data.filter((item) => {
    const matchTab = activeTab === '1' 
      ? item.status !== 'request_cancel' 
      : item.status === 'request_cancel'; 

    const fullName = `${item.patient.first_name} ${item.patient.last_name}`.toLowerCase();
    const matchName = fullName.includes(searchText.toLowerCase());
    const matchDate = selectedDate ? item.appointment_date === selectedDate : true;
    
    // 🌟 3. เงื่อนไขกรองสถานะ
    const matchStatus = selectedStatus === 'all' ? true : item.status === selectedStatus;

    return matchTab && matchName && matchDate && matchStatus;
  });

  const columns: ColumnsType<AppointmentScheduleType> = [
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
    { 
      title: 'ชื่อคนไข้', 
      key: 'patient_name',
      render: (_, record) => `${record.patient.first_name} ${record.patient.last_name}`
    },
    { title: 'บริการ/การรักษา', dataIndex: 'type', key: 'type' },
    { 
      title: 'ทันตแพทย์', 
      key: 'dentist_name',
      render: (_, record) => `ทพ./ทพญ. ${record.dentist.first_name} ${record.dentist.last_name}`
    },
    {
      title: 'สถานะ',
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => {
        let color = 'blue'; 
        let text = 'รอดำเนินการ';
        
        if (status === 'scheduled') { 
          color = 'blue'; text = 'รอดำเนินการ'; 
        } else if (status === 'completed') { 
          color = 'green'; text = 'เสร็จสิ้น'; 
        } else if (status === 'cancelled') { 
          color = 'red'; text = 'ยกเลิกแล้ว'; 
        } else if (status === 'request_cancel') { 
          color = 'orange'; text = 'ส่งคำขอยกเลิก'; 
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="รายละเอียด" placement="top">
            <Link href={`/personnel/appointment-schedule/${record.appointment_id}`}>
              <Button 
                type="text" 
                icon={<ReadOutlined style={{ fontSize: '20px', color: '#1890ff' }} />} 
                style={{ padding: 0 }} 
              />
            </Link>
          </Tooltip>

          {record.status === 'request_cancel' && (
            <Popconfirm
              title="ยืนยันการยกเลิก"
              description={`คุณต้องการยืนยันคำขอยกเลิกนัดหมายของ ${record.patient.first_name} ใช่หรือไม่?`}
              onConfirm={() => handleConfirmCancel(record.appointment_id)}
              okText="ยืนยัน"
              cancelText="ปิด"
              okButtonProps={{ danger: true }}
            >
              <Button type="primary" danger size="small" style={{ borderRadius: '4px' }}>
                ยืนยันยกเลิก
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: '1', label: 'ตารางนัดหมายทั้งหมด' },
    { 
      key: '2', 
      label: (
        <span>
          คำขอยกเลิกนัดหมาย{' '}
          <Badge count={requestCancelCount} style={{ backgroundColor: '#ff4d4f', marginLeft: 4 }} offset={[0, -2]} />
        </span>
      ) 
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>ตารางการนัดหมาย</Title>
            <Text type="secondary">จัดการและตรวจสอบคิวการนัดหมาย</Text>
          </div>
          <Link href="/personnel/appointment-schedule/create">
            <Button type="primary" size="large" icon={<PlusOutlined />} style={{ borderRadius: '8px' }}>
              เพิ่มการนัดหมาย
            </Button>
          </Link>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} style={{ marginBottom: '16px' }} />

        <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Input 
            placeholder="ค้นหาชื่อ-นามสกุล คนไข้..." 
            prefix={<SearchOutlined />} 
            value={searchText} 
            onChange={(e) => setSearchText(e.target.value)} 
            style={{ width: 250, borderRadius: '8px' }} 
            allowClear 
          />
          <DatePicker 
            placeholder="เลือกวันที่" 
            style={{ borderRadius: '8px', width: 150 }} 
            onChange={(_, dateString) => setSelectedDate(Array.isArray(dateString) ? dateString[0] : dateString)} 
          />
          
          {/* 🌟 4. เพิ่ม Dropdown กรองสถานะตรงนี้ (ซ่อนเมื่ออยู่ Tab คำขอยกเลิก เพราะมีสถานะเดียวอยู่แล้ว) */}
          {activeTab === '1' && (
            <Select
              defaultValue="all"
              style={{ width: 160 }}
              onChange={(value) => setSelectedStatus(value)}
              options={[
                { value: 'all', label: 'สถานะทั้งหมด' },
                { value: 'scheduled', label: 'รอดำเนินการ' },
                { value: 'completed', label: 'เสร็จสิ้น' },
                { value: 'cancelled', label: 'ยกเลิกแล้ว' },
              ]}
            />
          )}
        </div>

        <Table 
          columns={columns} 
          dataSource={finalFilteredData} 
          rowKey="appointment_id" 
          pagination={{ pageSize: 5 }} 
          loading={loading} 
        />
      </Card>
    </div>
  );
}