'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Card,
  Typography,
  Button,
  Input,
  Modal,
  Form,
  Select,
  Popconfirm,
  message,
  Space,
  DatePicker
} from 'antd';

import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';

import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;

interface AppointmentType {
  id: number;
  patient_id: number;
  patient_name: string;
  staff_id: number;
  dentist_name: string;
  appointment_date: string;
  appointment_time: string;
  treatment: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export default function AppointmentSchedulePage() {

  const [data, setData] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [form] = Form.useForm();

  const fetchAppointments = async () => {
    setLoading(true);
    try {

      const mockData: AppointmentType[] = [
        {
          id: 1,
          patient_id: 101,
          patient_name: 'สมชาย ใจดี',
          staff_id: 5,
          dentist_name: 'ทพ. สมเกียรติ',
          appointment_date: '2026-03-15',
          appointment_time: '09:00:00',
          treatment: 'ขูดหินปูน',
          status: 'confirmed'
        },
        {
          id: 2,
          patient_id: 102,
          patient_name: 'สุดา ดีมาก',
          staff_id: 3,
          dentist_name: 'ทพ. วิชัย',
          appointment_date: '2026-03-16',
          appointment_time: '10:30:00',
          treatment: 'อุดฟัน',
          status: 'pending'
        }

      ];

      setData(mockData);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSave = async () => {

    try {

      const values = await form.validateFields();

      setLoading(true);

      if (editingId) {
        message.success('อัปเดตข้อมูลสำเร็จ');
      } else {
        message.success('เพิ่มข้อมูลสำเร็จ');
      }

      setIsModalOpen(false);

    } finally {
      setLoading(false);
    }

  };

  const filteredData = data.filter((item) => {

    const matchName = item.patient_name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchDate = selectedDate
      ? item.appointment_date === selectedDate
      : true;

    return matchName && matchDate;

  });

  const columns: ColumnsType<AppointmentType> = [

    {
      title: 'รหัสนัดหมาย',
      dataIndex: 'id'
    },

    {
      title: 'ชื่อคนไข้',
      dataIndex: 'patient_name'
    },

    {
      title: 'วันและเวลา',
      render: (_, record) =>
        `${record.appointment_date} ${record.appointment_time}`
    },

    {
      title: 'ทันตแพทย์',
      dataIndex: 'dentist_name'
    },

    {
      title: 'บริการ/การรักษา',
      dataIndex: 'treatment'
    },

    {
      title: 'สถานะ',
      dataIndex: 'status',
      render: (status) => {

        let color = 'blue';
        let text = 'รอดำเนินการ';

        if (status === 'confirmed') {
          color = 'cyan';
          text = 'ยืนยันแล้ว';
        }

        if (status === 'completed') {
          color = 'green';
          text = 'เสร็จสิ้น';
        }

        if (status === 'cancelled') {
          color = 'red';
          text = 'ยกเลิก';
        }

        return <Tag color={color}>{text}</Tag>;

      }
    },

    {
      title: 'จัดการ',
      render: (_, record) => (

        <Space>

          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingId(record.id);
              setIsModalOpen(true);
              form.setFieldsValue(record);
            }}
          >
            แก้ไข
          </Button>

          <Popconfirm
            title="ลบข้อมูล?"
            onConfirm={() => message.success('ลบสำเร็จ')}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              ลบ
            </Button>
          </Popconfirm>

        </Space>

      )
    }

  ];

  return (

    <div style={{ padding: 24 }}>

      <Card
        title={
          <div>

            <Title level={4} style={{ marginBottom: 0 }}>
              ตารางการนัดหมาย
            </Title>

            <div style={{ fontSize: 14, color: '#888' }}>
              จัดการและตรวจสอบคิวการนัดหมายของคลินิก
            </div>

          </div>
        }

        extra={

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              setIsModalOpen(true);
              form.resetFields();
            }}
          >
            เพิ่มการนัดหมาย
          </Button>

        }
      >

        <Space style={{ marginBottom: 16 }}>

          <Input.Search
            placeholder="ค้นหาชื่อคนไข้..."
            allowClear
            style={{ width: 250 }}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <DatePicker
            placeholder="เลือกวันที่"
            onChange={(date) =>
              setSelectedDate(
                date ? dayjs(date).format('YYYY-MM-DD') : null
              )
            }
          />

        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
        />

        <Modal
          title={editingId ? "แก้ไขนัดหมาย" : "เพิ่มนัดหมายใหม่"}
          open={isModalOpen}
          onOk={form.submit}
          onCancel={() => setIsModalOpen(false)}
          confirmLoading={loading}
        >

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >

            <Form.Item
              name="patient_id"
              label="รหัสคนไข้"
              rules={[{ required: true }]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              name="staff_id"
              label="รหัสทันตแพทย์"
              rules={[{ required: true }]}
            >
              <Input type="number" />
            </Form.Item>

            <Space style={{ display: 'flex' }} align="baseline">

              <Form.Item
                name="appointment_date"
                label="วันที่"
                rules={[{ required: true }]}
              >
                <Input type="date" />
              </Form.Item>

              <Form.Item
                name="appointment_time"
                label="เวลา"
                rules={[{ required: true }]}
              >
                <Input type="time" />
              </Form.Item>

            </Space>

            <Form.Item
              name="treatment"
              label="การรักษา"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="status"
              label="สถานะ"
              initialValue="pending"
            >
              <Select
                options={[
                  { value: 'pending', label: 'รอดำเนินการ' },
                  { value: 'confirmed', label: 'ยืนยันแล้ว' },
                  { value: 'completed', label: 'เสร็จสิ้น' },
                  { value: 'cancelled', label: 'ยกเลิก' }
                ]}
              />
            </Form.Item>

          </Form>

        </Modal>

      </Card>

    </div>

  );

}