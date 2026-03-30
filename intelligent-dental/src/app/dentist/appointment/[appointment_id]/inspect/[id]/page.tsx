"use client";

import { useEffect, useState } from "react";
import {
  Form,
  DatePicker,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Space,
  Row,
  Col,
  message,
  Divider,
  Spin,
} from "antd";

import {
  ArrowLeftOutlined,
  SaveOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

import { useRouter, useParams } from "next/navigation";
import { withAuthHeaders } from "@/app/utils/auth.client";
import dayjs from "dayjs";

const { Title } = Typography;

export default function EditInspectionPage() {
  const router = useRouter();
  const params = useParams();

  const recordId = params?.id as string;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  // 🔥 โหลดข้อมูลเก่า
  useEffect(() => {
    if (!recordId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/inspection_records/${recordId}`,
          { headers: withAuthHeaders() }
        );

        if (!res.ok) throw new Error("โหลดไม่สำเร็จ");

        const j = await res.json();
        const data = j.data || j;

        // ✅ set ค่าเข้า form
        form.setFieldsValue({
          date: data.date ? dayjs(data.date) : null,
          history: data.history || "",
          status: data.status || undefined,
        });
      } catch (err) {
        console.error(err);
        message.error("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoadingPage(false);
      }
    };

    fetchData();
  }, [recordId, form]);

  // 🔥 submit
  const onFinish = async (values: any) => {
    setLoading(true);

    const payload = {
      ...values,
      date: values.date?.format("YYYY-MM-DD"),
    };

    try {
      message.loading({ content: "กำลังบันทึก...", key: "save" });

      const res = await fetch(
        `/api/inspection_records/${recordId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...withAuthHeaders(),
          },
          body: JSON.stringify(payload),
        }
      );

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
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      {/* 🔄 FIX: ใช้ Spin ครอบ แทน return ออก */}
      <Spin spinning={loadingPage}>
        {/* 🔙 */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          ย้อนกลับ
        </Button>

        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <Title level={3}>
            <HistoryOutlined style={{ color: "#1890ff", marginRight: 10 }} />
            แก้ไขบันทึกการตรวจ
          </Title>

          {/* ✅ สำคัญ: form ต้องอยู่ตลอด */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="date"
                  label="วันที่ตรวจ"
                  rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="status"
                  label="สถานะ"
                  rules={[{ required: true }]}
                >
                  <Select
                    options={[
                      { value: "scheduled", label: "รอนัดหมาย" },
                      { value: "completed", label: "เสร็จสิ้น" },
                      { value: "cancelled", label: "ยกเลิก" },
                      { value: "request_cancel", label: "ขอเปิดยกเลิก" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Form.Item
              name="history"
              label="รายละเอียดการตรวจ"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={6} />
            </Form.Item>

            <div style={{ textAlign: "right", marginTop: 24 }}>
              <Space>
                <Button onClick={() => router.back()}>ยกเลิก</Button>

                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  บันทึก
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </Spin>
    </div>
  );
}