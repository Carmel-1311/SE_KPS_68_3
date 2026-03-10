"use client";

import { useState, useEffect } from "react";
import { Table, Button, Modal, Input, Space, Popconfirm, Form, Row, Col, DatePicker, Select, message, Tag } from "antd";
import { EditOutlined, DeleteOutlined, UserAddOutlined, IdcardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

// --- ส่วนของ Mock Data ที่เพิ่มประเภทผู้ป่วย ---
const MOCK_PATIENTS = [
  { 
    id: 1, name: "สมชาย ใจดี", email: "somchai.j@email.com", 
    first_name: "สมชาย", last_name: "ใจดี", phone: "081-234-5678", 
    birthday: "1990-05-15", citizen_id: "1-1001-01234-56-1", status: "active", 
    patient_type: "general", allergy: "แพ้ยาเพนิซิลลิน" 
  },
  { 
    id: 2, name: "สมหญิง รักเรียน", email: "somying.r@email.com", 
    first_name: "สมหญิง", last_name: "รักเรียน", phone: "082-345-6789", 
    birthday: "1985-11-20", citizen_id: "3-2104-55678-90-2", status: "active", 
    patient_type: "onsite", allergy: null 
  },
  { 
    id: 3, name: "มานะ อดทน", email: "mana.o@email.com", 
    first_name: "มานะ", last_name: "อดทน", phone: "089-876-5432", 
    birthday: "1995-02-10", citizen_id: "1-5509-99876-11-3", status: "inactive", 
    patient_type: "general", allergy: "แพ้อาหารทะเล" 
  },
  { 
    id: 4, name: "ชูใจ ใฝ่ดี", email: "choojai.f@email.com", 
    first_name: "ชูใจ", last_name: "ใฝ่ดี", phone: "085-555-4444", 
    birthday: "2000-08-25", citizen_id: "1-1234-56789-00-4", status: "active", 
    patient_type: "onsite", allergy: null 
  },
];

export default function PatientsPage() {
  const [items, setItems] = useState(MOCK_PATIENTS);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const showModal = (record?: any) => {
    if (record) {
      setEditingId(record.id);
      const fullData = items.find(i => i.id === record.id);
      form.setFieldsValue({
        ...fullData,
        birthday: fullData?.birthday ? dayjs(fullData.birthday) : null
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        birthday: values.birthday ? dayjs(values.birthday).format("YYYY-MM-DD") : ""
      };

      if (editingId) {
        setItems(items.map(i => i.id === editingId 
          ? { ...i, ...payload, name: `${payload.first_name} ${payload.last_name}` } 
          : i
        ));
        message.success("แก้ไขข้อมูลสำเร็จ");
      } else {
        const newItem = {
          id: Date.now(),
          ...payload,
          name: `${payload.first_name} ${payload.last_name}`
        };
        setItems([...items, newItem]);
        message.success("เพิ่มข้อมูลสำเร็จ");
      }
      setOpen(false);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "ชื่อ-นามสกุล", dataIndex: "name", key: "name" },
    { 
      title: "ประเภทผู้ป่วย", 
      dataIndex: "patient_type", 
      key: "patient_type",
      render: (type: string) => {
        return type === "onsite" 
          ? <Tag color="blue">ตรวจนอกสถานที่</Tag> 
          : <Tag color="default">ผู้ป่วยธรรมดา</Tag>;
      }
    },
    { title: "อีเมล", dataIndex: "email", key: "email" },
    {
      title: "จัดการ",
      key: "action",
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>แก้ไข</Button>
          <Popconfirm title="ลบข้อมูล?" onConfirm={() => setItems(items.filter(i => i.id !== record.id))}>
            <Button type="link" danger icon={<DeleteOutlined />}>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>จัดการรายชื่อคนไข้</h2>
        <Button type="primary" icon={<UserAddOutlined />} onClick={() => showModal()}>
          เพิ่มคนไข้ใหม่
        </Button>
      </div>

      <Table columns={columns} dataSource={items} rowKey="id" />

      <Modal
        open={open}
        onOk={handleSave}
        onCancel={() => setOpen(false)}
        title={editingId ? "แก้ไขข้อมูลคนไข้" : "เพิ่มข้อมูลคนไข้"}
        width={700}
        okText="บันทึก"
        cancelText="ยกเลิก"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="patient_type" 
                label="ประเภทการเข้ารับบริการ" 
                rules={[{ required: true, message: 'กรุณาเลือกประเภทผู้ป่วย' }]}
                initialValue="general"
              >
                <Select size="large">
                  <Select.Option value="general">ผู้ป่วยธรรมดา</Select.Option>
                  <Select.Option value="onsite">มาจากการยื่นขอใช้บริการตรวจนอกสถานที่</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}><Form.Item name="first_name" label="ชื่อ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="last_name" label="นามสกุล" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}><Form.Item name="email" label="อีเมล" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="เบอร์โทรศัพท์" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}><Form.Item name="birthday" label="วันเกิด" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="citizen_id" label="เลขบัตรประชาชน" rules={[{ required: true }]}><Input prefix={<IdcardOutlined />} /></Form.Item></Col>
          </Row>

          <Form.Item name="allergy" label="ข้อมูลการแพ้ยา"><Input.TextArea rows={2} placeholder="ระบุประวัติการแพ้ยา (ถ้ามี)" /></Form.Item>
          
          <Form.Item name="status" label="สถานะการเป็นคนไข้" initialValue="active">
            <Select>
              <Select.Option value="active">ปกติ (Active)</Select.Option>
              <Select.Option value="inactive">ระงับการบริการ (Inactive)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}