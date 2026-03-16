"use client";

import { useEffect } from "react";
import { Form, DatePicker, Input, Select, Button, Card, Typography, Space, Row, Col, Divider, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined, MedicineBoxOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";

const { Title } = Typography;

export default function EditMedicalPage() {
  const router = useRouter();
  const params = useParams();
  const [form] = Form.useForm();

  useEffect(() => {
    // จำลองการดึงข้อมูล Medical Record เดิมมาแสดง
    form.setFieldsValue({
      date: dayjs("2024-03-01"),
      status: "completed",
      history: "มีอาการไอเล็กน้อย ต่อเนื่องมา 3 วัน",
      detail: [
        { type_id: 1, diagnosis: "Common Cold (หวัดธรรมดา)" }
      ]
    });
  }, [params.recordId, form]);

  const onFinish = (values: any) => {
    const payload = { ...values, id: params.recordId, date: values.date.format("YYYY-MM-DD") };
    console.log("Updating Medical Record:", payload);
    message.success("อัปเดตประวัติการรักษาสำเร็จ");
    router.back();
  };

  return (
    <div style={{ padding: '24px', maxWidth: '850px', margin: '0 auto' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} style={{ marginBottom: 16 }}>ย้อนกลับ</Button>
      <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
        <Title level={3}><MedicineBoxOutlined style={{ color: '#52c41a' }} /> แก้ไขบันทึกการรักษา</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="date" label="วันที่รักษา" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" /></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="สถานะ" rules={[{ required: true }]}><Select options={[{ value: 'completed', label: 'เสร็จสิ้น' }, { value: 'scheduled', label: 'รอนัดหมาย' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="history" label="ประวัติ/อาการ" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
          
          <Divider orientation="horizontal">รายละเอียดวินิจฉัย</Divider>
          <Form.List name="detail">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...restField} name={[name, 'type_id']} rules={[{ required: true }]}><Input placeholder="ID" style={{ width: 80 }} /></Form.Item>
                    <Form.Item {...restField} name={[name, 'diagnosis']} rules={[{ required: true }]}><Input placeholder="วินิจฉัย" style={{ width: 400 }} /></Form.Item>
                    {fields.length > 1 && <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />}
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>เพิ่มรายการวินิจฉัย</Button>
              </>
            )}
          </Form.List>

          <Divider />
          <Row justify="end">
            <Space>
              <Button onClick={() => router.back()}>ยกเลิก</Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}>บันทึกการแก้ไข</Button>
            </Space>
          </Row>
        </Form>
      </Card>
    </div>
  );
}