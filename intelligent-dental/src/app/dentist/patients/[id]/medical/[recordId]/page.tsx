"use client";

import { useEffect, useState } from "react";
import { 
  Form, DatePicker, Input, Select, Button, Card, 
  Typography, Space, Row, Col, Divider, message 
} from "antd";
import { 
  ArrowLeftOutlined, SaveOutlined, MedicineBoxOutlined, 
  PlusOutlined, MinusCircleOutlined 
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";
import { withAuthHeaders } from "@/app/utils/auth.client";

const { Title, Text } = Typography;

const formatInspectionRecordLabel = (record: {
  date?: string;
  status?: string;
  history?: string;
}) => {
  const formattedDate = record.date
    ? dayjs(record.date).format("DD/MM/YYYY HH:mm")
    : "-";

  return [
    formattedDate,
    record.status ? `- ${record.status}` : "",
    record.history ? `: ${record.history}` : "",
  ].join(" ");
};

export default function EditMedicalPage() {
  const router = useRouter();
  const params = useParams();
  const [form] = Form.useForm();
  
  const [examTypes, setExamTypes] = useState<{ id: number; name: string }[]>([]);
  const [inspectionRecords, setInspectionRecords] = useState<any[]>([]);
  const [loadingInspections, setLoadingInspections] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);

  useEffect(() => {
    const fetchExamTypes = async () => {
      setLoadingTypes(true);
      try {
        const res = await fetch("/api/types", { headers: withAuthHeaders() });
        const j = await res.json();
        setExamTypes(Array.isArray(j.data) ? j.data : j.data?.data || j || []);
      } catch (err) {
        console.error("Failed to fetch exam types", err);
      } finally {
        setLoadingTypes(false);
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
            type_id: d.examination_type?.id || d.type_id || undefined, 
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
  }, [params.recordId, params.id, form]);

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
      message.success({ content: 'อัปเดตสำเร็จ', key: 'update_med' });
      router.back();
    }).catch(err => {
      console.error('Update error', err);
      message.error({ content: 'ไม่สามารถอัปเดตข้อมูลได้', key: 'update_med' });
    })
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
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
            แก้ไขบันทึกการรักษา
          </Title>
          <Text type="secondary">แก้ไขรายละเอียดการวินิจฉัยและข้อมูลการรักษา</Text>
        </div>

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
                <Select.Option
                  key={rec.id}
                  value={rec.id}
                  label={formatInspectionRecordLabel(rec)}
                >
                  {formatInspectionRecordLabel(rec)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="date" label="วันที่รับการรักษา" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} size="large" format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="status" label="สถานะการรักษา" rules={[{ required: true }]}> 
                <Select
                  size="large"
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

          <Form.Item name="history" label="ประวัติ/อาการ" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="ระบุอาการของผู้ป่วยและการรักษา..." />
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
              <Button size="large" onClick={() => router.back()}>ยกเลิก</Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                size="large"
                htmlType="submit" 
                icon={<SaveOutlined />} 
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                บันทึกการแก้ไข
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}
