"use client";

import {
  Form,
  DatePicker,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Divider,
  Row,
  Col,
  message,
  Spin,
} from "antd";

import {
  ArrowLeftOutlined,
  PlusOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";

import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

  const appointmentId = searchParams.get("appointment_id");

  const [form] = Form.useForm();
  const [examTypes, setExamTypes] = useState<ExaminationType[]>([]);
  const [inspectionRecord, setInspectionRecord] = useState<any>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  // =========================
  // 🔥 LOAD DATA (NEW FLOW)
  // =========================
  useEffect(() => {
    const load = async () => {
      if (!appointmentId) return;

      try {
        // 1️⃣ appointment
        const aRes = await fetch(`/api/appointments/${appointmentId}`, {
          headers: withAuthHeaders(),
        });
        if (!aRes.ok) throw new Error("Appointment not found");

        const aJson = await aRes.json();
        const appointment = aJson.data || aJson;

        // ✅ fix patient
        const pid = appointment.patient?.id;
        setPatientId(pid);

        // 2️⃣ inspection record
        const inspectionId = appointment.inspection_record?.id;

        if (inspectionId) {
          const iRes = await fetch(
            `/api/inspection_records/${inspectionId}`,
            { headers: withAuthHeaders() }
          );

          if (iRes.ok) {
            const iJson = await iRes.json();
            setInspectionRecord(iJson.data || iJson);
          }
        }

        // 3️⃣ types
        const tRes = await fetch("/api/types", {
          headers: withAuthHeaders(),
        });
        const tJson = await tRes.json();
        setExamTypes(Array.isArray(tJson) ? tJson : tJson.data || []);

      } catch (err) {
        console.error(err);
        message.error("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoadingPage(false);
      }
    };

    load();
  }, [appointmentId]);

  // =========================
  // 🔥 SUBMIT
  // =========================
  const onFinish = async (values: any) => {
    if (!patientId) {
      message.error("ไม่พบข้อมูลผู้ป่วย");
      return;
    }

    if (!inspectionRecord?.id) {
      message.error("ไม่มีข้อมูลการตรวจ");
      return;
    }

    if (!values.detail || values.detail.length === 0) {
      message.error("กรุณาเพิ่ม Diagnosis");
      return;
    }

    setLoading(true);

    const payload = {
      patient_id: patientId,
      date: values.date.format("YYYY-MM-DD"),
      history: values.history,
      status: "done",
      inspection_record_id: inspectionRecord.id,
      detail: values.detail.map((d: any) => ({
        type_id: Number(d.type_id),
        diagnosis: d.diagnosis,
      })),
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
      const medicalId = j?.data?.id ?? j?.id;

      // update appointment
      await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...withAuthHeaders(),
        },
        body: JSON.stringify({ medical_record: medicalId }),
      });

      message.success({ content: "บันทึกสำเร็จ", key: "save" });

      router.push(`/dentist/appointment?examination_id=${medicalId}`);

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

        {/* ❌ ไม่มี inspection */}
        {!inspectionRecord && (
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

        {/* ✅ มี inspection */}
        {inspectionRecord && (
          <>
            {/* preview */}
            <Card
              size="small"
              style={{ marginBottom: 16, background: "#fafafa" }}
            >
              <Text strong>ข้อมูลการตรวจ</Text>
              <br />
              <Text>วันที่: {dayjs(inspectionRecord.date).format("YYYY-MM-DD")}</Text>
              <br />
              <Text>สถานะ: {inspectionRecord.status}</Text>
              <br />
              <Text>รายละเอียด: {inspectionRecord.history}</Text>
            </Card>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                date: dayjs(),
                detail: [{ type_id: undefined, diagnosis: "" }],
              }}
            >
              <Form.Item
                name="date"
                label="วันที่"
                rules={[{ required: true }]}
              >
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
          </>
        )}
      </Card>
    </div>
  );
}