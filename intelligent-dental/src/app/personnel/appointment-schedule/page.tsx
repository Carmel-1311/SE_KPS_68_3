'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography, Button, Input, DatePicker, Modal, Form, Select, Popconfirm, message, Space } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface AppointmentType {
  id: number;
  patient_id: number;
  patient_name?: string;
  staff_id: number;
  dentist_name?: string;
  appointment_date: string;
  appointment_time: string;
  treatment: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export default function AppointmentSchedulePage() {
  const [data, setData] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        const mockResponse: AppointmentType[] = [
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
            patient_name: 'สมหญิง รักสวย',
            staff_id: 6,
            dentist_name: 'ทพญ. นภา',
            appointment_date: '2026-03-15',
            appointment_time: '10:30:00',
            treatment: 'อุดฟัน',
            status: 'pending'
          }
        ];
        setData(mockResponse);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error(error);
      message.error('โหลดข้อมูลล้มเหลว');
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

      const payload = {
        patient_id: Number(values.patient_id),
        staff_id: Number(values.staff_id),
        appointment_date: values.appointment_date,
        appointment_time: values.appointment_time,
        treatment: values.treatment,
        status: values.status
      };

      if (editingId) {
        const updatedData = data.map((item) => 
          item.id === editingId ? { ...item, ...payload, patient_name: 'สมมติชื่อ (อัปเดต)', dentist_name: 'สมมติหมอ (อัปเดต)' } : item
        );
        setData(updatedData);
        message.success('อัปเดตข้อมูลการนัดหมายสำเร็จ');
      } else {
        const newId = Math.floor(Math.random() * 1000) + 100;
        const newEntry: AppointmentType = { 
          id: newId, 
          ...payload, 
          patient_name: 'ดึงชื่อจาก API', 
          dentist_name: 'ดึงหมอจาก API' 
        };
        setData([...data, newEntry]);
        message.success('เพิ่มการนัดหมายเรียบร้อยแล้ว');
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      setData(data.filter((item) => item.id !== id));
      message.success('ลบข้อมูลการนัดหมายสำเร็จ');
    } catch (error) {
      console.error(error);
      message.error('ลบข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((item) => {
    const matchName = item.patient_name?.toLowerCase().includes(searchText.toLowerCase());
    const matchDate = selectedDate ? item.appointment_date === selectedDate : true;
    return matchName && matchDate;
  });

  const openModal = (record?: AppointmentType) => {
    setEditingId(record ? record.id : null);
    setIsModalOpen(true);
    setTimeout(() => {
      if (record) {
        form.setFieldsValue(record);
      } else {
        form.resetFields();
        form.setFieldsValue({ status: 'pending' });
      }
    }, 0);
  };

  const columns: ColumnsType<AppointmentType> = [
    { title: 'ID', dataIndex: 'id', key: 'id', render: (text) => <Text strong>{text}</Text> },
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
    { title: 'ทันตแพทย์', dataIndex: 'dentist_name', key: 'dentist_name' },
    {
      title: 'สถานะ',
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => {
        let color = 'blue'; let text = 'รอดำเนินการ';
        if (status === 'confirmed') { color = 'cyan'; text = 'ยืนยันแล้ว'; } 
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
          <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)} style={{ padding: 0 }}>
            แก้ไข
          </Button>
          <Popconfirm title="ลบการนัดหมายนี้?" onConfirm={() => handleDelete(record.id)} okText="ลบ" cancelText="ยกเลิก" okButtonProps={{ danger: true }}>
            <Button type="link" danger icon={<DeleteOutlined />} style={{ padding: 0 }}>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>ตารางการนัดหมาย</Title>
            <Text type="secondary">จัดการและตรวจสอบคิวการนัดหมายของคลินิก</Text>
          </div>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openModal()} style={{ borderRadius: '8px' }}>
            เพิ่มการนัดหมาย
          </Button>
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
          <DatePicker
            placeholder="เลือกวันที่"
            style={{ borderRadius: '8px' }}
            onChange={(_, dateString) => setSelectedDate(Array.isArray(dateString) ? dateString[0] : dateString)}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          loading={loading}
        />

        <Modal
          title={editingId ? `แก้ไขการนัดหมาย (ID: ${editingId})` : "เพิ่มการนัดหมายใหม่"}
          open={isModalOpen}
          onOk={form.submit}
          onCancel={() => setIsModalOpen(false)}
          okText="บันทึก"
          cancelText="ยกเลิก"
          destroyOnHidden
          confirmLoading={loading}
        >
          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: '20px' }}
            onFinish={handleSave}
          >
            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item name="patient_id" label="รหัสคนไข้ (Patient ID)" style={{ flex: 1 }} rules={[{ required: true, message: 'ระบุรหัสคนไข้' }]}>
                <Input type="number" placeholder="เช่น 101" />
              </Form.Item>
              <Form.Item name="staff_id" label="รหัสทันตแพทย์ (Staff ID)" style={{ flex: 1 }} rules={[{ required: true, message: 'ระบุรหัสทันตแพทย์' }]}>
                <Input type="number" placeholder="เช่น 5" />
              </Form.Item>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item name="appointment_date" label="วันที่นัด" style={{ flex: 1 }} rules={[{ required: true }]}>
                <Input type="date" />
              </Form.Item>
              <Form.Item name="appointment_time" label="เวลา" style={{ flex: 1 }} rules={[{ required: true }]}>
                <Input type="time" />
              </Form.Item>
            </div>

            <Form.Item name="treatment" label="บริการ/การรักษา" rules={[{ required: true, message: 'ระบุการรักษา' }]}>
              <Input placeholder="เช่น อุดฟัน, ขูดหินปูน" />
            </Form.Item>

            <Form.Item name="status" label="สถานะ">
              <Select>
                <Select.Option value="pending">รอดำเนินการ</Select.Option>
                <Select.Option value="confirmed">ยืนยันแล้ว</Select.Option>
                <Select.Option value="completed">เสร็จสิ้น</Select.Option>
                <Select.Option value="cancelled">ยกเลิก</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

      </Card>
    </div>
  );
}