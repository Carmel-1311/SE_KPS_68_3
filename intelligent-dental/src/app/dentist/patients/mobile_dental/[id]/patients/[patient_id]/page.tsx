"use client";

import { useState } from "react";
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

export default function NewInspectionPage() {
    const router = useRouter();
    const params = useParams();

    const paMoId = params.id; // mobile dental id
    const patientId = params.patient_id;

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);

        try {
            message.loading({ content: "กำลังบันทึก...", key: "save" });

            // ✅ 1. สร้าง inspection ก่อน
            const inspectionPayload = {
                ...values,
                date: values.date.format("YYYY-MM-DD"),
                patient_id: Number(patientId),
            };

            const res1 = await fetch("/api/inspection_records", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...withAuthHeaders(),
                },
                body: JSON.stringify(inspectionPayload),
            });

            if (!res1.ok) throw new Error("Create inspection failed");

            const json1 = await res1.json();
            const newInspection = json1.data || json1;

            // ✅ 2. เอา inspection_id ไป update mobile dental
            const payload = {
                patients_id: patientId, // 🔥 required
                inspection_id: newInspection.id,
            };

            const res2 = await fetch(
                `/api/mobile_dentals/patients/${paMoId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...withAuthHeaders(),
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!res2.ok) throw new Error("Update mobile dental failed");

            message.success({ content: "บันทึกสำเร็จ", key: "save" });
            router.back();
        } catch (err) {
            console.error(err);
            message.error({ content: "ไม่สามารถบันทึกได้", key: "save" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
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
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    borderRadius: "16px",
                }}
            >
                <Title level={3}>
                    <HistoryOutlined
                        style={{ color: "#52c41a", marginRight: 10 }}
                    />
                    เพิ่มบันทึกการตรวจ
                </Title>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        date: dayjs(),
                        status: "completed",
                    }}
                >
                    <Row gutter={24}>
                        {/* 📅 Date */}
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="date"
                                label="วันที่ตรวจ"
                                rules={[{ required: true }]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    size="large"
                                    format="YYYY-MM-DD"
                                />
                            </Form.Item>
                        </Col>

                        {/* 📌 Status */}
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="status"
                                label="สถานะ"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    size="large"
                                    options={[
                                        { value: "scheduled", label: "เรียบร้อย" },
                                        { value: "completed", label: "ควรรักษา" },
                                        { value: "cancelled", label: "ปกติ" },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    {/* 📝 History */}
                    <Form.Item
                        name="history"
                        label="รายละเอียดการตรวจ"
                        rules={[{ required: true }]}
                    >
                        <Input.TextArea rows={6} />
                    </Form.Item>

                    {/* 🔘 */}
                    <div style={{ marginTop: 40, textAlign: "right" }}>
                        <Space>
                            <Button onClick={() => router.back()}>
                                ยกเลิก
                            </Button>

                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={loading}
                                style={{ background: "#52c41a" }}
                            >
                                บันทึก
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Card>
        </div>
    );
}