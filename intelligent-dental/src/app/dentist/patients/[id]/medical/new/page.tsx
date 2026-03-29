"use client";

import { 
  Form, DatePicker, Input, Select, Button, Card, 
  Typography, Space, Divider, Row, Col, message 
} from "antd";
import { 
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, 
  MinusCircleOutlined, MedicineBoxOutlined 
} from "@ant-design/icons";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { withAuthHeaders } from "@/app/utils/auth.client";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'รอนัดหมาย (Scheduled)' },
  { value: 'done', label: 'เสร็จสิ้น (Done)' },
  { value: 'cancelled', label: 'ยกเลิก (Cancelled)' },
  { value: 'request_cancel', label: 'ขอเปิดยกเลิก (Request Cancel)' },
];

interface ExaminationType {
  id: number;
  name: string;
}

export default function NewMedicalRecordPage() {
  const router = useRouter();
  const params = useParams(); // รับ patient id จาก URL
  const [form] = Form.useForm();
  const [examTypes, setExamTypes] = useState<ExaminationType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [inspectionRecords, setInspectionRecords] = useState<any[]>([]);
  const [loadingInspections, setLoadingInspections] = useState(false);

  // รับ appointment_id จาก query string
  const searchParams = useSearchParams();
  const appointmentIdFromQuery = searchParams.get("appointment_id");

  // ดึงข้อมูลประเภทการตรวจจาก API เมื่อโหลดหน้า
  useEffect(() => {
    const fetchExamTypes = async () => {
      setLoadingTypes(true);
      try {
        const res = await fetch('/api/types', {
          headers: { ...withAuthHeaders() }
        });
        if (!res.ok) throw new Error('Failed to fetch types');
        const data = await res.json();
        setExamTypes(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error('Fetch exam types error:', err);
        message.error('ไม่สามารถดึงข้อมูลประเภทการตรวจได้');
      } finally {
        setLoadingTypes(false);
      }
    };
    const fetchInspectionRecords = async () => {
      setLoadingInspections(true);
      try {
        const res = await fetch(`/api/patients/${params.id}/inspection_records`, {
          headers: { ...withAuthHeaders() }
        });
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
    fetchExamTypes();
    fetchInspectionRecords();
  }, [params.id]);

  // เพิ่มรองรับ appointment_id (query string เท่านั้น)
  const onFinish = async (values: any) => {
    const payload: any = {
      patient_id: Number(params.id),
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
    // ใช้ appointment_id จาก query string เท่านั้น
    const appointmentId = appointmentIdFromQuery ? Number(appointmentIdFromQuery) : undefined;

    message.loading({ content: 'กำลังบันทึกประวัติการรักษา...', key: 'save_md' });

    try {
      const res = await fetch('/api/medical_records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...withAuthHeaders() },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Save failed');
      const j = await res.json();

      // ถ้ามี appointment_id ให้ PATCH appointment เพื่อเชื่อม examination_id (medical record)
      const examinationId = j?.data?.id ?? j?.id;
      if (appointmentId && examinationId) {
        await fetch(`/api/appointments/${appointmentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...withAuthHeaders() },
          body: JSON.stringify({ examination_id: examinationId })
        });
      }

      message.success({ content: 'เพิ่มประวัติการรักษาสำเร็จ', key: 'save_md' });
      router.push(`/dentist/appointment?examination_id=${examinationId}`);
    } catch (err) {
      console.error('Save error', err);
      message.error({ content: 'ไม่สามารถบันทึกข้อมูลได้', key: 'save_md' });
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Navigation Header */}
      <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} style={{ marginBottom: 16 }}>
        ย้อนกลับ
      </Button>

      <Card 
        variant={"outlined"} 
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px' }}
      >
        <div style={{ marginBottom: 24 }}>
          <Title level={3}>
            <MedicineBoxOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            เพิ่มบันทึกการรักษาใหม่
          </Title>
          <Text type="secondary">กรอกรายละเอียดการวินิจฉัยและแผนการรักษาสำหรับคนไข้ ID: {params.id}</Text>
        </div>

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish}
          initialValues={{ 
            date: dayjs(), 
            status: 'done',
            detail: [{ type_id: undefined, diagnosis: '' }],
            inspection_record_id: undefined,
            appointment_id: appointmentIdFromQuery ? Number(appointmentIdFromQuery) : undefined
          }}
        >
                    {/* Hidden field for appointment_id to ensure it is submitted */}
                    <Form.Item name="appointment_id" hidden>
                      <Input type="hidden" />
                    </Form.Item>
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
            <Col xs={24} sm={12}>
              <Form.Item 
                name="date" 
                label="วันที่รับการรักษา" 
                rules={[{ required: true, message: 'กรุณาระบุวันที่' }]}
              >
                <DatePicker style={{ width: '100%' }} size="large" format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="status" 
                label="สถานะการรักษา" 
                initialValue="done"
                hidden
              >
                <Input type="hidden" />
              </Form.Item>
              <div style={{ marginTop: 32 }}>
                <Text strong>สถานะการรักษา: <span style={{ color: '#52c41a' }}>เสร็จสิ้น (Done)</span></Text>
              </div>
            </Col>
          </Row>

          <Form.Item 
            name="history" 
            label="อาการสำคัญ / ประวัติการรักษา" 
            rules={[{ required: true, message: 'กรุณากรอกประวัติการรักษา' }]}
          >
            <Input.TextArea rows={4} placeholder="ระบุอาการของผู้ป่วยและการรักษาเบื้องต้น..." />
          </Form.Item>

          <Divider orientation="horizontal">
            <Text strong>รายละเอียดการวินิจฉัย (Diagnosis Details)</Text>
          </Divider>

          <Form.List name="detail">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    type="inner" 
                    style={{ marginBottom: 16, background: '#fafafa' }}
                    styles={{ body: { padding: '16px' } }}
                  >
                    <Row gutter={16} align="middle">
                      <Col xs={24} sm={10}>
                        <Form.Item
                          {...restField}
                          name={[name, 'type_id']}
                          label="ประเภทการตรวจ"
                          rules={[{ required: true, message: 'กรุณาเลือกประเภท' }]}
                        >
                          <Select 
                            placeholder="เลือกประเภท" 
                            loading={loadingTypes}
                            showSearch
                            optionFilterProp="label"
                          >
                            {examTypes.map(type => (
                              <Select.Option key={type.id} value={type.id} label={type.name}>
                                {type.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={20} sm={11}>
                        <Form.Item
                          {...restField}
                          name={[name, 'diagnosis']}
                          label="ผลวินิจฉัย"
                          rules={[{ required: true, message: 'กรุณากรอกผลวินิจฉัย' }]}
                        >
                          <Input placeholder="ระบุชื่อโรคหรือผลการวินิจฉัย" />
                        </Form.Item>
                      </Col>
                      <Col xs={4} sm={3} style={{ textAlign: 'center', marginTop: 8 }}>
                        {fields.length > 1 && (
                          <Button 
                            type="text" 
                            danger 
                            icon={<MinusCircleOutlined />} 
                            onClick={() => remove(name)} 
                          />
                        )}
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button 
                  type="dashed" 
                  onClick={() => add()} 
                  block 
                  icon={<PlusOutlined />}
                  style={{ height: '45px' }}
                >
                  เพิ่มรายการวินิจฉัย
                </Button>
              </>
            )}
          </Form.List>

          <Divider />

          <Row justify="end" gutter={12}>
            <Col>
              <Button size="large" onClick={() => router.back()}>
                ยกเลิก
              </Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                size="large" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                บันทึกประวัติการรักษา
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}