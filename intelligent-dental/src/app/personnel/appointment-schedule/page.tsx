'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography, Button, Input, DatePicker, Modal, Form, Select, Popconfirm, message } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface AppointmentType {
  id: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  dentistName: string;
  treatment: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export default function AppointmentSchedulePage() {
  const [allData, setAllData] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState<boolean>(false); 
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm(); 

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setAllData([]); 
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      message.error('โหลดข้อมูลล้มเหลว กรุณาลองใหม่');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredData = allData.filter((item) => {
    const matchName = item.patientName.toLowerCase().includes(searchText.toLowerCase());
    const matchDate = selectedDate ? item.appointmentDate === selectedDate : true;
    return matchName && matchDate;
  });

  // 👇 แก้ไขตรงนี้: หน่วงเวลาให้ Form render เสร็จก่อนค่อยเคลียร์ค่า
  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setIsModalOpen(true);
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };

  // 👇 แก้ไขตรงนี้: หน่วงเวลาให้ Form render เสร็จก่อนค่อยใส่ข้อมูลเดิม
  const openEditModal = (record: AppointmentType) => {
    setModalMode('edit');
    setEditingId(record.id);
    setIsModalOpen(true);
    setTimeout(() => {
      form.setFieldsValue(record);
    }, 0);
  };

  // 👇 เพิ่มฟังก์ชันนี้: เพื่อเคลียร์ฟอร์มตอนกดปิด Modal
  const handleCancel = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      form.resetFields();
    }, 200); // รอให้แอนิเมชัน Modal ปิดเสร็จก่อนค่อยลบข้อมูล
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (modalMode === 'add') {
        const newId = Math.random().toString(36).substring(2, 9);
        const newData: AppointmentType = { id: newId, ...values };
        setAllData([...allData, newData]);
        message.success('เพิ่มการนัดหมายเรียบร้อยแล้ว');
      } else {
        const updatedData = allData.map((item) => (item.id === editingId ? { ...item, ...values } : item));
        setAllData(updatedData);
        message.success('อัปเดตข้อมูลสำเร็จ');
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  const columns: ColumnsType<AppointmentType> = [
    { title: 'รหัสนัดหมาย', dataIndex: 'id', key: 'id', render: (text) => <Text strong>{text}</Text> },
    {
      title: 'วันและเวลา',
      key: 'datetime',
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text>{record.appointmentDate}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.appointmentTime} น.</Text>
        </div>
      ),
    },
    { title: 'ชื่อคนไข้', dataIndex: 'patientName', key: 'patientName' },
    { title: 'บริการ/การรักษา', dataIndex: 'treatment', key: 'treatment' },
    { title: 'ทันตแพทย์', dataIndex: 'dentistName', key: 'dentistName' },
    {
      title: 'สถานะ',
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => {
        let color = 'blue'; let text = 'รอดำเนินการ';
        if (status === 'confirmed') { 
          color = 'cyan'; text = 'ยืนยันแล้ว'; 
        } 
        else if (status === 'completed') { 
          color = 'green'; text = 'เสร็จสิ้น'; 
        } 
        else if (status === 'cancelled') { 
          color = 'red'; text = 'ยกเลิก'; }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)} style={{ padding: 0 }}>
            แก้ไข
          </Button>
          <Popconfirm title="ลบรายการนี้?" onConfirm={() => handleDelete(record.id)} okText="ลบ" cancelText="ยกเลิก" okButtonProps={{ danger: true }}>
            <Button type="link" danger icon={<DeleteOutlined />} style={{ padding: 0 }}>ลบ</Button>
          </Popconfirm>
        </div>
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
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openAddModal} style={{ borderRadius: '8px' }}>
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
          title={modalMode === 'add' ? "เพิ่มการนัดหมายใหม่" : `แก้ไขการนัดหมาย: ${editingId}`}
          open={isModalOpen}
          onOk={form.submit} 
          onCancel={handleCancel} // 👇 เปลี่ยนมาเรียกใช้ handleCancel ตรงนี้
          okText="บันทึก"
          cancelText="ยกเลิก"
          destroyOnHidden 
          confirmLoading={loading} 
        >
          <Form 
            form={form} 
            layout="vertical" 
            style={{ marginTop: '20px' }} 
            initialValues={{ status: 'pending' }}
            onFinish={handleSave} 
          >
            <Form.Item name="patientName" label="ชื่อคนไข้" rules={[{ required: true, message: 'กรุณากรอกชื่อคนไข้' }]}>
              <Input placeholder="ระบุชื่อ-นามสกุล" />
            </Form.Item>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item name="appointmentDate" label="วันที่นัด" style={{ flex: 1 }} rules={[{ required: true }]}>
                <Input placeholder="YYYY-MM-DD" /> 
              </Form.Item>
              <Form.Item name="appointmentTime" label="เวลา" style={{ flex: 1 }} rules={[{ required: true }]}>
                <Input placeholder="HH:mm" />
              </Form.Item>
            </div>

            <Form.Item name="treatment" label="บริการ/การรักษา">
              <Input placeholder="เช่น อุดฟัน, ขูดหินปูน" />
            </Form.Item>

            <Form.Item name="dentistName" label="ทันตแพทย์">
              <Input placeholder="ชื่อทันตแพทย์ผู้ดูแล" />
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