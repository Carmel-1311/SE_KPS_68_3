'use client';

import React, { useState } from 'react';
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  CalendarOutlined,
  HomeOutlined,
  PlusOutlined,
  ReadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

import { useAppointment, APPOINTMENT_STATUS_META } from '@/hook/useAppointment';
import type { Appointment } from '@/hook/useAppointment';

const { Title, Text } = Typography;

export default function AppointmentListPage() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;
  const { data, loading, updateStatus, requestCancelCount } = useAppointment();

  const handleConfirmCancel = async (id: number) => {
    try {
      await updateStatus(id, 'cancelled');
      message.success('ยืนยันการยกเลิกนัดหมายเรียบร้อยแล้ว');
    } catch {
      message.error('อัปเดตสถานะไม่สำเร็จ');
    }
  };

  const filteredAppointments = data.filter((item) => {
    if (item.status === 'cancelled') return false;

    const matchesTab =
      activeTab === 'all'
        ? item.status !== 'request_cancel'
        : item.status === 'request_cancel';

    const matchesName = item.patient.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesDate = selectedDate
      ? item.appointment_date.startsWith(selectedDate)
      : true;
    const matchesStatus =
      activeTab === 'request' || selectedStatus === 'all'
        ? true
        : item.status === selectedStatus;

    return matchesTab && matchesName && matchesDate && matchesStatus;
  });

  const columns: ColumnsType<Appointment> = [
    {
      title: 'ลำดับ',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_value, _record, index) => (
        <Text strong>{(currentPage - 1) * pageSize + index + 1}</Text>
      ),
    },
    {
      title: 'วันและเวลา',
      key: 'datetime',
      render: (_value, record) => (
        <Space orientation="vertical" size={0}>
          <Text>{dayjs(record.appointment_date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary">
            {dayjs(`2000-01-01 ${record.appointment_time}`).format('HH:mm')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'ชื่อคนไข้',
      key: 'patient_name',
      render: (_value, record) => <Text strong>{record.patient.name}</Text>,
    },
    {
      title: 'บริการ/การรักษา',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'ทันตแพทย์',
      key: 'staff_name',
      render: (_value, record) => <Text>{record.staff.name}</Text>,
    },
    {
      title: 'สถานะ',
      key: 'status',
      render: (_value, record) => {
        const meta = APPOINTMENT_STATUS_META[record.status];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: '',
      key: 'action',
      width: 180,
      render: (_value, record) => (
        <Space size="middle">
          <Tooltip title="รายละเอียด">
            <Link href={`/personnel/appointment-schedule/${record.appointment_id}`}>
              <Button type="text" icon={<ReadOutlined />} />
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
              <Button type="primary" danger size="small">
                ยืนยันยกเลิก
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb
        items={[
          {
            title: (
              <a onClick={() => router.push('/')}>
                <HomeOutlined /> หน้าหลัก
              </a>
            ),
          },
          {
            title: (
              <span>
                <CalendarOutlined /> ตารางการนัดหมาย
              </span>
            ),
          },
        ]}
      />

      <Card style={{ marginTop: 16 }}>
        <Row
          gutter={[16, 16]}
          align="middle"
          justify="space-between"
          style={{ marginBottom: 16 }}
        >
          <Col xs={24} md={16}>
            <Title level={3} style={{ margin: 0 }}>
              ตารางการนัดหมาย
            </Title>
            <Text type="secondary">จัดการและตรวจสอบคิวการนัดหมาย</Text>
          </Col>

          <Col xs={24} md="auto">
            <Link href="/personnel/appointment-schedule/create">
              <Button type="primary" icon={<PlusOutlined />}>
                เพิ่มการนัดหมาย
              </Button>
            </Link>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={10} lg={8}>
            <Input
              placeholder="ค้นหาชื่อคนไข้..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={24} md={7} lg={5}>
            <DatePicker
              placeholder="เลือกวันที่"
              style={{ width: '100%' }}
              onChange={(_value, dateString) =>
                setSelectedDate(
                  Array.isArray(dateString) ? dateString[0] : dateString
                )
              }
            />
          </Col>

          {activeTab === 'all' && (
            <Col xs={24} md={7} lg={5}>
              <Select
                value={selectedStatus}
                style={{ width: '100%' }}
                onChange={setSelectedStatus}
                options={[
                  { value: 'all', label: 'สถานะทั้งหมด' },
                  { value: 'scheduled', label: 'รอดำเนินการ' },
                  { value: 'completed', label: 'เสร็จสิ้น' },
                ]}
              />
            </Col>
          )}
        </Row>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setCurrentPage(1);
          }}
          items={[
            {
              key: 'all',
              label: 'ตารางนัดหมายทั้งหมด',
            },
            {
              key: 'request',
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
          ]}
        />

        <Table
          columns={columns}
          dataSource={filteredAppointments}
          rowKey="appointment_id"
          loading={loading}
          pagination={{
            pageSize,
            current: currentPage,
            onChange: setCurrentPage,
          }}
          locale={{ emptyText: 'ไม่พบข้อมูลในสถานะนี้' }}
        />
      </Card>
    </div>
  );
}
