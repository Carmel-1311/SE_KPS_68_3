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
  SaveOutlined,
  PlusOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";

import { useRouter, useParams } from "next/navigation";
import { withAuthHeaders } from "@/app/utils/auth.client";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

interface ExaminationType {
  id: number;
  name: string;
}

export default function EditMedicalRecordPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params?.id as string;

  const [form] = Form.useForm();
  const [examTypes, setExamTypes] = useState<ExaminationType[]>([]);
  const [inspectionRecords, setInspectionRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  // =========================
  // 🔥 LOAD DATA
  // =========================
  useEffect(() => {
    if (!recordId) return;

    const load = async () => {
      try {
        // โหลด type ก่อน
        const t = await fetch("/api/types", {
          headers: withAuthHeaders(),
        });
        const tJson = await t.json();
        const types = Array.isArray(tJson) ? tJson : tJson.data || [];
        setExamTypes(types);

        // โหลด medical record
        const r = await fetch(`/api/medical_records/${recordId}`, {
          headers: withAuthHeaders(),
        });
        const rJson = await r.json();
        const data = rJson.data || rJson;

        // โหลด inspection
        let inspectionList: any[] = [];
        let preview = null;

        const inspectionId =
          data.inspection_record_id ||
          data.inspection_record?.id;

        if (inspectionId) {
          const iRes = await fetch(
            `/api/inspection_records/${inspectionId}`,
            { headers: withAuthHeaders() }
          );

          if (iRes.ok) {
            const iJson = await iRes.json();
            const record = iJson?.data || iJson;

            if (record) {
              inspectionList = [record];
              preview = record;
            }
          }
        }

        setInspectionRecords(inspectionList);

        // 🔥 FIX: cast type_id เป็น number
        const mappedDetail =
          data.detail?.map((d: any) => ({
            type_id: Number(d.examination_type.id),
            diagnosis: d.diagnosis,
          })) || [];

        // set form
        form.setFieldsValue({
          date: data.date ? dayjs(data.date) : null,
          history: data.history,
          inspection_record_id: inspectionId,
          preview: preview,
          detail: mappedDetail,
        });

      } catch (err) {
        console.error(err);
        message.error("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoadingPage(false);
      }
    };

    load();
  }, [recordId, form]);

  // =========================
  // 🔥 SUBMIT
  // =========================
  const onFinish = async (values: any) => {
    if (!values.detail?.length) {
      message.error("กรุณาเพิ่ม Diagnosis");
      return;
    }

    setLoading(true);

    const payload = {
      date: values.date.format("YYYY-MM-DD"),
      history: values.history,
      inspection_record_id: Number(values.inspection_record_id),
      detail: values.detail.map((d: any) => ({
        type_id: Number(d.type_id),
        diagnosis: d.diagnosis,
      })),
    };

    try {
      const uniqueTypes = new Set();

      for (const d of values.detail) {
        if (uniqueTypes.has(d.type_id)) {
          message.error("ห้ามเลือกประเภทซ้ำ");
          return;
        }
        uniqueTypes.add(d.type_id);
      }

      message.loading({ content: "กำลังบันทึก...", key: "save" });

      const res = await fetch(`/api/medical_records/${recordId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...withAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      message.success({ content: "แก้ไขสำเร็จ", key: "save" });
      router.back();

    } catch (err) {
      console.error(err);
      message.error({ content: "เกิดข้อผิดพลาด", key: "save" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <Spin spinning={loadingPage}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          ย้อนกลับ
        </Button>

        <Card>
          <Title level={3}>
            <MedicineBoxOutlined style={{ color: "#faad14" }} />
            {" "}แก้ไขประวัติการรักษา
          </Title>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            {/* inspection */}
            <Form.Item
              name="inspection_record_id"
              label="ประวัติการตรวจ"
              rules={[{ required: true }]}
            >
              <Select disabled={inspectionRecords.length <= 1}>
                {inspectionRecords.map((rec) => (
                  <Select.Option key={rec.id} value={rec.id}>
                    {dayjs(rec.date).format("YYYY-MM-DD")} - {rec.status}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* preview */}
            <Form.Item shouldUpdate>
              {() => {
                const preview = form.getFieldValue("preview");
                if (!preview) return null;

                return (
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Text strong>ข้อมูลการตรวจ</Text>
                    <br />
                    <Text>วันที่: {dayjs(preview.date).format("YYYY-MM-DD")}</Text>
                    <br />
                    <Text>สถานะ: {preview.status}</Text>
                    <br />
                    <Text>รายละเอียด: {preview.history}</Text>
                  </Card>
                );
              }}
            </Form.Item>

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
              icon={<SaveOutlined />}
            >
              บันทึกการแก้ไข
            </Button>
          </Form>
        </Card>
      </Spin>
    </div>
  );
}