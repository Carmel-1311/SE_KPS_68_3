"use client";

import { useState } from "react";
import { Table, Button, Modal, Input, Space, Popconfirm, Form, Row, Col, DatePicker, Select } from "antd";
import { EditOutlined, DeleteOutlined, UserAddOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

// Interface สำหรับแสดงผลในตาราง (GET /api/patients)
interface PatientListItem {
  id: number;
  name: string;
  email: string;
}

// Interface สำหรับ Form (POST/PUT ตาม API Spec)
interface PatientFormValues {
  first_name: string;
  last_name: string;
  birthday: string;
  email: string;
  phone: string;
  citizen_id: string;
  allergy?: string | null;
  status?: string | null;
}

export default function PatientsPage() {
  const [items, setItems] = useState<PatientListItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const showModal = (record?: PatientListItem) => {
    if (record) {
      setEditingId(record.id);
      // ในงานจริงต้อง Get ข้อมูลรายละเอียดเต็มจาก /api/patients/{id} 
      // แต่เบื้องต้นเราจะแยกชื่อเพื่อใส่ในฟอร์มไปก่อน
      const [first, ...last] = record.name.split(" ");
      form.setFieldsValue({
        first_name: first,
        last_name: last.join(" "),
        email: record.email,
        status: "active"
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
      // แปลงวันที่จาก dayjs เป็น string format "YYYY-MM-DD"
      const payload = {
        ...values,
        birthday: values.birthday ? dayjs(values.birthday).format("YYYY-MM-DD") : ""
      };

      if (editingId) {
        // กรณีแก้ไข (PUT)
        setItems(items.map(i => i.id === editingId 
          ? { ...i, name: `${payload.first_name} ${payload.last_name}`, email: payload.email } 
          : i
        ));
      } else {
        // กรณีเพิ่มใหม่ (POST)
        const newItem: PatientListItem = {
          id: Date.now(), // จำลอง ID
          name: `${payload.first_name} ${payload.last_name}`,
          email: payload.email
        };
        setItems([...items, newItem]);
      }
      setOpen(false);
    } catch (error) {
      console.log("Validate Failed:", error);
    }
  };

  const deleteItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "ชื่อ-นามสกุล", dataIndex: "name", key: "name" },
    { title: "อีเมล", dataIndex: "email", key: "email" },
    {
      title: "จัดการ",
      key: "action",
      width: 200,
      render: (_: any, record: PatientListItem) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>แก้ไข</Button>
          <Popconfirm title="ยืนยันการลบ?" onConfirm={() => deleteItem(record.id)} okText="ลบ" cancelText="ยกเลิก">
            <Button danger icon={<DeleteOutlined />}>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>รายชื่อคนไข้</h2>
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
      >
        <Form form={form} layout="vertical" name="patientFullForm" initialValues={{ status: 'active' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="first_name" label="ชื่อ" rules={[{ required: true }]}>
                <Input placeholder="ชื่อ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="last_name" label="นามสกุล" rules={[{ required: true }]}>
                <Input placeholder="นามสกุล" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="อีเมล" rules={[{ required: true, type: 'email' }]}>
                <Input placeholder="example@mail.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="เบอร์โทรศัพท์" rules={[{ required: true }]}>
                <Input placeholder="08x-xxx-xxxx" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="birthday" label="วันเกิด" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="citizen_id" label="เลขบัตรประชาชน" rules={[{ required: true }]}>
                <Input placeholder="x-xxxx-xxxxx-xx-x" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="allergy" label="ข้อมูลการแพ้ยา (ถ้ามี)">
            <Input.TextArea rows={2} placeholder="ระบุประวัติการแพ้ยา" />
          </Form.Item>

          <Form.Item name="status" label="สถานะ">
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}