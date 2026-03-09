'use client';

import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Button, DatePicker, Modal, Form, Select, Popconfirm, message, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

// 1. กำหนด Interface อิงตามโครงสร้าง Swagger API และ UI (มีวันที่, ชื่อ, เวลาเริ่ม-จบ, สาขา)
interface WorkScheduleType {
  id: string;
  dentistName: string;
  workDate: string;
  startTime: string;
  endTime: string;
  branch: string;
}

// 2. Data Mock สำหรับตารางการทำงาน
const mockWorkSchedules: WorkScheduleType[] = [
  { id: 'WS-001', dentistName: 'ทพ. สมเกียรติ รักดี', workDate: '2026-02-01', startTime: '09:00', endTime: '17:00', branch: 'สาขาใหญ่ (คลินิก)' },
  { id: 'WS-002', dentistName: 'ทพญ. นภา ใจเย็น', workDate: '2026-02-01', startTime: '10:00', endTime: '19:00', branch: 'สาขาใหญ่ (คลินิก)' },
  { id: 'WS-003', dentistName: 'ทพ. สมเกียรติ รักดี', workDate: '2026-02-02', startTime: '09:00', endTime: '12:00', branch: 'หน่วยรถทันตกรรมเคลื่อนที่' },
  { id: 'WS-004', dentistName: 'ทพ. วินัย มั่นคง', workDate: '2026-02-03', startTime: '13:00', endTime: '20:00', branch: 'สาขาใหญ่ (คลินิก)' },
];

export default function WorkSchedulePage() {
  const [allData, setAllData] = useState<WorkScheduleType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // State สำหรับตัวกรอง (Filter)
  const [selectedDentist, setSelectedDentist] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // State สำหรับ Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // จำลองการดึงข้อมูล API (GET work_schedules)
  const fetchWorkSchedules = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setAllData(mockWorkSchedules);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error(error);
      message.error('โหลดข้อมูลล้มเหลว กรุณาลองใหม่');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkSchedules();
  }, []);

  // ฟังก์ชันกรองข้อมูลตาม ทันตแพทย์ และ เดือนที่เลือก
  const filteredData = allData.filter((item) => {
    const matchDentist = selectedDentist ? item.dentistName.includes(selectedDentist) : true;
    const matchMonth = selectedMonth ? item.workDate.startsWith(selectedMonth) : true;
    return matchDentist && matchMonth;
  });

  // เปิด Modal เพิ่มข้อมูล
  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setIsModalOpen(true);
    setTimeout(() => form.resetFields(), 0);
  };

  // เปิด Modal แก้ไขข้อมูล
  const openEditModal = (record: WorkScheduleType) => {
    setModalMode('edit');
    setEditingId(record.id);
    setIsModalOpen(true);
    setTimeout(() => {
      // ใช้ dayjs แปลง format วันที่เพื่อให้แสดงใน DatePicker ได้ (ถ้าใช้ DatePicker ใน Form)
      // แต่ในตัวอย่างนี้ใช้ Input type="date" หรือ Select เพื่อความง่ายไปก่อน
      form.setFieldsValue(record);
    }, 0);
  };

  // ปิด Modal
  const handleCancel = () => {
    setIsModalOpen(false);
    setTimeout(() => form.resetFields(), 200);
  };

  // บันทึกข้อมูล (POST / PUT work_schedule)
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (modalMode === 'add') {
        const newId = `WS-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        const newData: WorkScheduleType = { id: newId, ...values };
        setAllData([...allData, newData]);
        message.success('เพิ่มเวลาการทำงานเรียบร้อยแล้ว');
      } else {
        const updatedData = allData.map((item) => (item.id === editingId ? { ...item, ...values } : item));
        setAllData(updatedData);
        message.success('อัปเดตข้อมูลสำเร็จ');
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Validation Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // ลบข้อมูล (DEL work_schedule)
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      setAllData(allData.filter((item) => item.id !== id));
      message.success('ลบข้อมูลสำเร็จ');
    } catch (error) {
      console.error(error);
      message.error('ลบข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  // ตั้งค่าคอลัมน์ตาราง
  const columns: ColumnsType<WorkScheduleType> = [
    { 
      title: 'วันที่', 
      dataIndex: 'workDate', 
      key: 'workDate',
      render: (text) => <Text strong>{text}</Text>
    },
    { 
      title: 'ชื่อ-นามสกุล', 
      dataIndex: 'dentistName', 
      key: 'dentistName' 
    },
    {
      title: 'เวลา',
      key: 'time',
      render: (_, record) => (
        <Text>{record.startTime} - {record.endTime} น.</Text>
      ),
    },
    { 
      title: 'สาขา', 
      dataIndex: 'branch', 
      key: 'branch' 
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)} style={{ padding: 0 }}>
            แก้ไข
          </Button>
          <Popconfirm title="ลบเวลาการทำงานนี้?" onConfirm={() => handleDelete(record.id)} okText="ลบ" cancelText="ยกเลิก" okButtonProps={{ danger: true }}>
            <Button type="link" danger icon={<DeleteOutlined />} style={{ padding: 0 }}>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>ตารางการทำงาน</Title>
            <Text type="secondary">จัดการและตรวจสอบเวลาการออกตรวจของทันตแพทย์</Text>
          </div>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openAddModal} style={{ borderRadius: '8px' }}>
            เพิ่มเวลาการทำงาน
          </Button>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '16px' }}>
          <Select
            placeholder="ค้นหาทันตแพทย์..."
            style={{ width: 300 }}
            allowClear
            onChange={(value) => setSelectedDentist(value)}
          >
            <Option value="ทพ. สมเกียรติ">ทพ. สมเกียรติ รักดี</Option>
            <Option value="ทพญ. นภา">ทพญ. นภา ใจเย็น</Option>
            <Option value="ทพ. วินัย">ทพ. วินัย มั่นคง</Option>
          </Select>

          <DatePicker 
            picker="month"
            placeholder="เลือกเดือน" 
            style={{ borderRadius: '8px', width: 200 }} 
            onChange={(_, dateString) => setSelectedMonth(Array.isArray(dateString) ? dateString[0] : dateString)} 
          />
        </div>

        {/* Table */}
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id" 
          pagination={{ pageSize: 7 }} 
          loading={loading} 
        />

        {/* Modal Form เพิ่ม/แก้ไข */}
        <Modal
          title={modalMode === 'add' ? "เพิ่มเวลาการทำงาน" : "แก้ไขเวลาการทำงาน"}
          open={isModalOpen}
          onOk={form.submit} 
          onCancel={handleCancel}
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
            <Form.Item name="dentistName" label="เลือกทันตแพทย์" rules={[{ required: true, message: 'กรุณาเลือกทันตแพทย์' }]}>
              <Select placeholder="เลือกทันตแพทย์">
                <Option value="ทพ. สมเกียรติ รักดี">ทพ. สมเกียรติ รักดี</Option>
                <Option value="ทพญ. นภา ใจเย็น">ทพญ. นภา ใจเย็น</Option>
                <Option value="ทพ. วินัย มั่นคง">ทพ. วินัย มั่นคง</Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="workDate" label="วันที่" rules={[{ required: true, message: 'กรุณาระบุวันที่' }]}>
              {/* ใช้ Input type date เพื่อความง่ายในการ bind ข้อมูลกับ mock string */}
              <input type="date" className="ant-input" style={{ width: '100%', padding: '7px 11px', borderRadius: '6px', border: '1px solid #d9d9d9' }} />
            </Form.Item>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item name="startTime" label="เวลาเริ่ม" style={{ flex: 1 }} rules={[{ required: true, message: 'กรุณาระบุเวลาเริ่ม' }]}>
                <input type="time" className="ant-input" style={{ width: '100%', padding: '7px 11px', borderRadius: '6px', border: '1px solid #d9d9d9' }} />
              </Form.Item>
              <Form.Item name="endTime" label="เวลาสิ้นสุด" style={{ flex: 1 }} rules={[{ required: true, message: 'กรุณาระบุเวลาสิ้นสุด' }]}>
                <input type="time" className="ant-input" style={{ width: '100%', padding: '7px 11px', borderRadius: '6px', border: '1px solid #d9d9d9' }} />
              </Form.Item>
            </div>

            <Form.Item name="branch" label="สาขาที่ออกตรวจ" rules={[{ required: true, message: 'กรุณาเลือกสาขา' }]}>
              <Select placeholder="เลือกสถานที่ออกตรวจ">
                <Option value="สาขาใหญ่ (คลินิก)">สาขาใหญ่ (คลินิก)</Option>
                <Option value="หน่วยรถทันตกรรมเคลื่อนที่">หน่วยรถทันตกรรมเคลื่อนที่</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

      </Card>
    </div>
  );
}