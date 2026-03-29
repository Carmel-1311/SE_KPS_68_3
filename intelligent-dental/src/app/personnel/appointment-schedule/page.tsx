'use client';

import React, { useState } from 'react';
import {
  Table,
  Tag,
  Card,
  Typography,
  Button,
  Input,
  DatePicker,
  Space,
  Tooltip,
  message,
  Breadcrumb,
  Popconfirm,
  Tabs,
  Badge,
  Select,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  ReadOutlined,
  HomeOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

import { useAppointment, APPOINTMENT_STATUS_META } from '@/hook/useAppointment';
import type { Appointment } from '@/hook/useAppointment';

const { Title, Text } = Typography;

// ---------------------------------------------------------------------------
// หน้าหลัก
// ---------------------------------------------------------------------------

export default function AppointmentListPage() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('1');
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 5;

  const { data, loading, updateStatus, requestCancelCount } = useAppointment();

  // ── ฟังก์ชันจัดการ ────────────────────────────────────────────────────────

  const handleConfirmCancel = async (id: number) => {
    try {
      await updateStatus(id, 'cancelled');
      message.success('ยืนยันการยกเลิกนัดหมายเรียบร้อยแล้ว');
    } catch {
      message.error('อัปเดตสถานะไม่สำเร็จ');
    }
  };

  // ── กรองข้อมูล ────────────────────────────────────────────────────────────

  const finalFilteredData = data.filter((item) => {
    if (item.status === 'cancelled') return false;

    const matchTab =
      activeTab === '1'
        ? item.status !== 'request_cancel'
        : item.status === 'request_cancel';

    const matchName = item.patient.name.toLowerCase().includes(searchText.toLowerCase());
    const matchDate = selectedDate ? item.appointment_date.startsWith(selectedDate) : true;
    const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchTab && matchName && matchDate && matchStatus;
  });

  // ── คอลัมน์ตาราง ──────────────────────────────────────────────────────────

  const columns: ColumnsType<Appointment> = [
    {
      title: 'ลำดับ',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => <Text strong>{(currentPage - 1) * PAGE_SIZE + index + 1}</Text>,
    },
    {
      title: 'วันและเวลา',
      key: 'datetime',
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text>{dayjs(record.appointment_date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(`2000-01-01 ${record.appointment_time}`).subtract(0, 'hour').format('HH:mm')}
          </Text>
        </div>
      ),
    },
    {
      title: 'ชื่อคนไข้',
      key: 'patient_name',
      render: (_, record) => <Text>{record.patient.name}</Text>,
    },
    {
      title: 'บริการ/การรักษา',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'ทันตแพทย์',
      key: 'staff_name',
      render: (_, record) => <Text> {record.staff.name}</Text>,
    },
    {
      title: 'สถานะ',
      key: 'status',
      render: (_, record) => {
        const meta = APPOINTMENT_STATUS_META[record.status];
        return <Tag color={meta.color}>{meta.label}</Tag>;
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
              description={`ต้องการยืนยันคำขอยกเลิกของ ${record.patient.name} ใช่หรือไม่?`}
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

  // ── รายการแท็บ ────────────────────────────────────────────────────────────

  const tabItems = [
    {
      key: '1',
      label: 'ตารางนัดหมายทั้งหมด',
    },
    {
      key: '2',
      label: (
        <span>
          คำขอยกเลิกนัดหมาย{' '}
          <Badge
            count={requestCancelCount}
            style={{ backgroundColor: '#ff4d4f', marginLeft: 4 }}
            offset={[0, -2]}
          />
        </span>
      ),
    },
  ];

  // ── แสดงผล ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb
        style={{ marginBottom: '24px', fontSize: '15px' }}
        items={[
          { title: <a onClick={() => router.push('/')}><HomeOutlined /> หน้าหลัก</a> },
          { title: <span><CalendarOutlined /> ตารางการนัดหมาย</span> },
        ]}
      />

      <Card
        variant="borderless"
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
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

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: '16px' }}
        />

        <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Input
            placeholder="ค้นหาชื่อคนไข้..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250, borderRadius: '8px' }}
            allowClear
          />
          <DatePicker
            placeholder="เลือกวันที่"
            style={{ borderRadius: '8px', width: 150 }}
            onChange={(_, dateString) =>
              setSelectedDate(Array.isArray(dateString) ? dateString[0] : dateString)
            }
          />
          {activeTab === '1' && (
            <Select
              defaultValue="all"
              style={{ width: 160 }}
              onChange={(value) => setSelectedStatus(value)}
              options={[
                { value: 'all', label: 'สถานะทั้งหมด' },
                { value: 'scheduled', label: 'รอดำเนินการ' },
                { value: 'completed', label: 'เสร็จสิ้น' },
              ]}
            />
          )}
        </div>

        <Table
          columns={columns}
          dataSource={finalFilteredData}
          rowKey="appointment_id"
          pagination={{ pageSize: PAGE_SIZE, current: currentPage, onChange: setCurrentPage }}
          loading={loading}
          locale={{ emptyText: 'ไม่พบข้อมูลในสถานะนี้' }}
        />
      </Card>
    </div>
  );
}
