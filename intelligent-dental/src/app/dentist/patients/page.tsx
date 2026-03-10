"use client";

import { useState } from "react";
import { Table, Button, Modal, Input, Space, Popconfirm, Form, Row, Col, DatePicker, Select, message, Tag, Tooltip } from "antd";
import { ReadOutlined, DeleteOutlined, UserAddOutlined, IdcardOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Search } = Input;

// --- Mock Data ---
const MOCK_PATIENTS = [
  { id: 1, name: "สมชาย ใจดี", email: "somchai.j@email.com", first_name: "สมชาย", last_name: "ใจดี", phone: "081-234-5678", birthday: "1990-05-15", citizen_id: "1-1001-01234-56-1", status: "active", patient_type: "general", allergy: "แพ้ยาเพนิซิลลิน" },
  { id: 2, name: "สมหญิง รักเรียน", email: "somying.r@email.com", first_name: "สมหญิง", last_name: "รักเรียน", phone: "082-345-6789", birthday: "1985-11-20", citizen_id: "3-2104-55678-90-2", status: "active", patient_type: "onsite", allergy: null },
  { id: 3, name: "มานะ อดทน", email: "mana.o@email.com", first_name: "มานะ", last_name: "อดทน", phone: "089-876-5432", birthday: "1995-02-10", citizen_id: "1-5509-99876-11-3", status: "inactive", patient_type: "general", allergy: "แพ้อาหารทะเล" },
  { id: 4, name: "ชูใจ ใฝ่ดี", email: "choojai.f@email.com", first_name: "ชูใจ", last_name: "ใฝ่ดี", phone: "085-555-4444", birthday: "2000-08-25", citizen_id: "1-1234-56789-00-4", status: "active", patient_type: "onsite", allergy: null },
];

export default function PatientsPage() {
  const [items, setItems] = useState(MOCK_PATIENTS);
  const [searchText, setSearchText] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const filteredItems = items.filter((item) => {
    const searchLower = searchText.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.email.toLowerCase().includes(searchLower) ||
      item.citizen_id.includes(searchLower)
    );
  });

  const showModal = (record?: any) => {
    if (record) {
      setEditingId(record.id);
      const fullData = items.find(i => i.id === record.id);
      form.setFieldsValue({ ...fullData, birthday: fullData?.birthday ? dayjs(fullData.birthday) : null });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, birthday: values.birthday ? dayjs(values.birthday).format("YYYY-MM-DD") : "" };
      if (editingId) {
        setItems(items.map(i => i.id === editingId ? { ...i, ...payload, name: `${payload.first_name} ${payload.last_name}` } : i));
        message.success("แก้ไขข้อมูลสำเร็จ");
      } else {
        setItems([...items, { id: Date.now(), ...payload, name: `${payload.first_name} ${payload.last_name}` }]);
        message.success("เพิ่มข้อมูลสำเร็จ");
      }
      setOpen(false);
    } catch (error) { console.log("Error:", error); }
  };

  // ฟังก์ชันลบพร้อมการแจ้งเตือน
  const deleteItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
    message.success("ลบข้อมูลสำเร็จ");
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "ชื่อ-นามสกุล", dataIndex: "name", key: "name" },
    { 
      title: "ประเภทผู้ป่วย", 
      dataIndex: "patient_type", 
      render: (type: string) => type === "onsite" ? <Tag color="blue">ตรวจนอกสถานที่</Tag> : <Tag color="default">ผู้ป่วยธรรมดา</Tag>
    },
    { title: "อีเมล", dataIndex: "email", key: "email" },
    {
      title: "จัดการ",
      key: "action",
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          {/* Tooltip สำหรับปุ่มแก้ไข/ดูรายละเอียด */}
          <Tooltip title="Detail" placement="top">
            <Button 
              type="link" 
              icon={<ReadOutlined style={{ fontSize: '20px' }} />} 
              onClick={() => showModal(record)} 
            />
          </Tooltip>
          
          {/* Tooltip สำหรับปุ่มลบ */}
          <Tooltip title="Delete" placement="top">
            <Popconfirm 
              title="ลบข้อมูล?" 
              onConfirm={() => deleteItem(record.id)}
              okText="ลบ"
              cancelText="ยกเลิก"
              okButtonProps={{ danger: true }}
            >
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined style={{ fontSize: '20px' }} />} 
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <h2 style={{ margin: 0, flexShrink: 0 }}>จัดการรายชื่อคนไข้</h2>
        <div style={{ display: 'flex', gap: '12px', flexGrow: 1, justifyContent: 'flex-end' }}>
          <Search
            placeholder="ค้นหาชื่อ, อีเมล หรือเลขบัตรประชาชน..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={(value) => setSearchText(value)}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
          />
          <Button type="primary" size="large" icon={<UserAddOutlined />} onClick={() => showModal()}>
            เพิ่มคนไข้ใหม่
          </Button>
        </div>
      </div>

      <Table columns={columns} dataSource={filteredItems} rowKey="id" />

      <Modal
        open={open}
        onOk={handleSave}
        onCancel={() => setOpen(false)}
        title={editingId ? "แก้ไขข้อมูลคนไข้" : "เพิ่มข้อมูลคนไข้"}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="patient_type" label="ประเภทการเข้ารับบริการ" rules={[{ required: true }]} initialValue="general">
            <Select size="large">
              <Select.Option value="general">ผู้ป่วยธรรมดา</Select.Option>
              <Select.Option value="onsite">มาจากการยื่นขอใช้บริการตรวจนอกสถานที่</Select.Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="first_name" label="ชื่อ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="last_name" label="นามสกุล" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="email" label="อีเมล" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="เบอร์โทรศัพท์" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="birthday" label="วันเกิด" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" /></Form.Item></Col>
            <Col span={12}><Form.Item name="citizen_id" label="เลขบัตรประชาชน" rules={[{ required: true }]}><Input prefix={<IdcardOutlined />} /></Form.Item></Col>
          </Row>
          <Form.Item name="allergy" label="ข้อมูลการแพ้ยา"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="status" label="สถานะ" initialValue="active">
            <Select>
              <Select.Option value="active">ปกติ (Active)</Select.Option>
              <Select.Option value="inactive">ระงับ (Inactive)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}