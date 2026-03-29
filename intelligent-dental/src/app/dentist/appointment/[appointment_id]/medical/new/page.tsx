"use client";

import {
  Form,
  DatePicker,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  message,
  Spin,
} from "antd";

import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { withAuthHeaders } from "@/app/utils/auth.client";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

interface ExaminationType {
  id: number;
  name: string;
}

export default function NewMedicalRecordPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const appointmentId = searchParams.get("appointment_id");

  const [form] = Form.useForm();
  const [examTypes, setExamTypes] = useState<ExaminationType[]>([]);
  const [inspectionRecords, setInspectionRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  // 🔥 load data
  useEffect(() => {
    const load = async () => {
      try {
        // types
        const t = await fetch("/api/types", {
          headers: withAuthHeaders(),
        });
        const tJson = await t.json();
        setExamTypes(Array.isArray(tJson) ? tJson : tJson.data || []);

        // inspections
        const i = await fetch(
          `/api/patients/${params.id}/inspection_records`,
          { headers: withAuthHeaders() }
        );
        const iJson = await i.json();
        const list = Array.isArray(iJson.data)
          ? iJson.data
          : iJson.data?.data || [];
        setInspectionRecords(list);
      } catch (err) {
        console.error(err);
        message.error("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoadingPage(false);
      }
    };

    load();
  }, [params.id]);

  // 🔥 submit
  const onFinish = async (values: any) => {
    setLoading(true);

    const payload: any = {
      patient_id: Number(params.id),
      date: values.date.format("YYYY-MM-DD"),
      history: values.history,
      status: "done",
      detail: values.detail.map((d: any) => ({
        type_id: Number(d.type_id),
        diagnosis: d.diagnosis,
      })),
      inspection_record_id: Number(values.inspection_record_id),
    };

    try {
      message.loading({ content: "กำลังบันทึก...", key: "save" });

      const res = await fetch("/api/medical_records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...withAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      const j = await res.json();
      const examinationId = j?.data?.id ?? j?.id;

      // 🔥 update appointment
      if (appointmentId && examinationId) {
        await fetch(`/api/appointments/${appointmentId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...withAuthHeaders(),
          },
          body: JSON.stringify({
            examination_id: examinationId,
          }),
        });
      }

      message.success({ content: "บันทึกสำเร็จ", key: "save" });

      router.push(`/dentist/appointment?examination_id=${examinationId}`);
    } catch (err) {
      console.error(err);
      message.error({ content: "เกิดข้อผิดพลาด", key: "save" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return <Spin style={{ display: "block", margin: 100 }} />;
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        style={{ marginBottom: 16 }}
      >
        ย้อนกลับ
      </Button>

      <Card>
        <Title level={3}>
          <MedicineBoxOutlined style={{ color: "#52c41a" }} /> เพิ่มประวัติการรักษา
        </Title>

        {/* 🔥 CASE 1: ไม่มี inspection */}
        {inspectionRecords.length === 0 && (
          <Card style={{ marginBottom: 16, background: "#fffbe6" }}>
            <Text strong>ยังไม่มีข้อมูลการตรวจ</Text>
            <br />
            <Button
              type="primary"
              style={{ marginTop: 12 }}
              onClick={() =>
                router.push(
                  `/dentist/appointment/${appointmentId}/inspect/new?appointment_id=${appointmentId}`
                )
              }
            >
              กรุณาเพิ่มข้อมูลการตรวจ
            </Button>
          </Card>
        )}

        {/* 🔥 CASE 2: มี inspection */}
        {inspectionRecords.length > 0 && (
          <>
            <Form.Item
              name="inspection_record_id"
              label="เลือกประวัติการตรวจ"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="เลือก"
                onChange={(id) => {
                  const selected = inspectionRecords.find(
                    (r) => r.id === id
                  );
                  form.setFieldsValue({ preview: selected });
                }}
              >
                {inspectionRecords.map((rec) => (
                  <Select.Option key={rec.id} value={rec.id}>
                    {dayjs(rec.date).format("YYYY-MM-DD")} - {rec.status}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* 🔥 preview */}
            <Form.Item shouldUpdate>
              {() => {
                const preview = form.getFieldValue("preview");
                if (!preview) return null;

                return (
                  <Card
                    size="small"
                    style={{ marginBottom: 16, background: "#fafafa" }}
                  >
                    <Text strong>ข้อมูลการตรวจ</Text>
                    <br />
                    <Text>
                      วันที่: {dayjs(preview.date).format("YYYY-MM-DD")}
                    </Text>
                    <br />
                    <Text>สถานะ: {preview.status}</Text>
                    <br />
                    <Text>รายละเอียด: {preview.history}</Text>
                  </Card>
                );
              }}
            </Form.Item>
          </>
        )}

        {/* 🔥 form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            date: dayjs(),
            detail: [{ type_id: undefined, diagnosis: "" }],
          }}
        >
          <Form.Item name="date" label="วันที่" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="history"
            label="ประวัติการรักษา"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Divider>Diagnosis</Divider>

          <Form.List name="detail">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Row key={key} gutter={8}>
                    <Col span={10}>
                      <Form.Item
                        name={[name, "type_id"]}
                        rules={[{ required: true }]}
                      >
                        <Select placeholder="ประเภท">
                          {examTypes.map((t) => (
                            <Select.Option key={t.id} value={t.id}>
                              {t.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={10}>
                      <Form.Item
                        name={[name, "diagnosis"]}
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Diagnosis" />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Button danger onClick={() => remove(name)}>
                        ลบ
                      </Button>
                    </Col>
                  </Row>
                ))}

                <Button onClick={() => add()} icon={<PlusOutlined />} block>
                  เพิ่มรายการ
                </Button>
              </>
            )}
          </Form.List>

          <Divider />

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{ background: "#52c41a" }}
          >
            บันทึก
          </Button>
        </Form>
      </Card>
    </div>
  );
}