"use client";

import { useEffect, useState } from "react";
import { Form, DatePicker, Input, Select, Button, Card, Typography, Space, Row, Col, Divider, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined, MedicineBoxOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";
import { withAuthHeaders } from "@/app/utils/auth.client";

const { Title } = Typography;

export default function EditMedicalPage() {
  const router = useRouter();
  const params = useParams();
  const [form] = Form.useForm();
  // 1. เพิ่ม state สำหรับเก็บรายการประเภทการตรวจ
  const [examTypes, setExamTypes] = useState<{ id: number; name: string }[]>([]);
  const [inspectionRecords, setInspectionRecords] = useState<any[]>([]);
  const [loadingInspections, setLoadingInspections] = useState(false);

  useEffect(() => {
    // 2. ดึงข้อมูลรายการประเภทการตรวจเพื่อใช้ใน Dropdown
    const fetchExamTypes = async () => {
      try {
        const res = await fetch("/api/types", { headers: withAuthHeaders() });
        const j = await res.json();
        setExamTypes(j.data || []);
      } catch (err) {
        console.error("Failed to fetch exam types", err);
      }
    };

    const fetchInspectionRecords = async () => {
      setLoadingInspections(true);
      try {
        const res = await fetch(`/api/patients/${params.id}/inspection_records`, { headers: withAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch inspection records');
        const data = await res.json();
        setInspectionRecords(Array.isArray(data.data) ? data.data : data.data?.data || []);
      } catch (err) {
        console.error('Fetch inspection records error:', err);
        message.error('ไม่สามารถดึงประวัติการตรวจได้');
      } finally {
        setLoadingInspections(false);
      }
    };

    const fetchRecord = async () => {
      try {
        const res = await fetch(`/api/medical_records/${params.recordId}`, { headers: withAuthHeaders() });
        if (!res.ok) throw new Error('Fetch failed');
        const j = await res.json();
        const data = j.data || j;
        form.setFieldsValue({
          date: dayjs(data.date),
          status: data.status,
          history: data.history,
          detail: (data.detail || []).map((d: any) => ({ 
            type_id: d.examination_type?.id || d.type_id || '', 
            diagnosis: d.diagnosis || d.diagnosis_ 
          })),
          inspection_record_id: data.inspection_record?.id || undefined
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchExamTypes();
    fetchInspectionRecords();
    fetchRecord();
  }, [params.recordId, form]);

  const onFinish = (values: any) => {
    const payload: any = {
      date: values.date.format("YYYY-MM-DD"),
      history: values.history,
      status: values.status,
      detail: (values.detail || []).map((d: any) => ({ 
        type_id: Number(d.type_id), 
        diagnosis: d.diagnosis 
      }))
    };
    if (values.inspection_record_id) {
      payload.inspection_record_id = Number(values.inspection_record_id);
    }
    message.loading({ content: 'กำลังอัปเดต...', key: 'update_med' });
    fetch(`/api/medical_records/${params.recordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...withAuthHeaders() },
      body: JSON.stringify(payload)
    }).then(async (res) => {
      if (!res.ok) throw new Error('Update failed')
      await res.json();
      message.success({ content: 'อัปเดตสำเร็จ', key: 'update_med' });
      router.back();
    }).catch(err => {
      console.error('Update error', err);
      message.error({ content: 'ไม่สามารถอัปเดตข้อมูลได้', key: 'update_med' });
    })
  }

  return (
    <div style={{ padding: '24px', maxWidth: '850px', margin: '0 auto' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} style={{ marginBottom: 16 }}>ย้อนกลับ</Button>
      <Card variant={"outlined"} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
        <Title level={3}><MedicineBoxOutlined style={{ color: '#52c41a' }} /> แก้ไขบันทึกการรักษา</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="inspection_record_id"
            label="เลือกประวัติการตรวจ (ถ้ามี)"
          >
            <Select
              placeholder="เลือกประวัติการตรวจ"
              loading={loadingInspections}
              allowClear
              showSearch
              optionFilterProp="label"
            >
              {inspectionRecords.map((rec) => (
                <Select.Option key={rec.id} value={rec.id} label={rec.date}>
                  {rec.date} {rec.status ? `- ${rec.status}` : ''} {rec.history ? `: ${rec.history}` : ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="date" label="วันที่รักษา" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" /></Form.Item></Col>
            <Col span={12}>
              <Form.Item name="status" label="สถานะ" rules={[{ required: true }]}> 
                <Select
                  options={[
                    { value: 'scheduled', label: 'รอนัดหมาย (Scheduled)' },
                    { value: 'done', label: 'เสร็จสิ้น (Done)' },
                    { value: 'cancelled', label: 'ยกเลิก (Cancelled)' },
                    { value: 'request_cancel', label: 'ขอเปิดยกเลิก (Request Cancel)' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="history" label="ประวัติ/อาการ" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
          
          <Divider orientation="horizontal">รายละเอียดวินิจฉัย</Divider>
          <Form.List name="detail">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    {/* 3. เปลี่ยนจาก Input เป็น Select สำหรับเลือกประเภทการตรวจ */}
                    <Form.Item 
                      {...restField} 
                      name={[name, 'type_id']} 
                      rules={[{ required: true, message: 'กรุณาเลือกประเภท' }]}
                    >
                      <Select 
                        placeholder="เลือกประเภท" 
                        style={{ width: 180 }}
                        options={examTypes.map(t => ({ value: t.id, label: t.name }))}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'diagnosis']} rules={[{ required: true, message: 'กรุณากรอกผลวินิจฉัย' }]}><Input placeholder="วินิจฉัย" style={{ width: 300 }} /></Form.Item>
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