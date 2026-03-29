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

import { useRouter, useSearchParams } from "next/navigation";
import { withAuthHeaders } from "@/app/utils/auth.client";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function NewInspectionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const appointmentId = searchParams.get("appointment_id");

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingAppointment, setLoadingAppointment] = useState(true);
    const [appointment, setAppointment] = useState<any>(null);

    // 🔥 โหลด appointment (เพื่อเอา patient_id)
    useEffect(() => {
        const loadAppointment = async () => {
            if (!appointmentId) {
                setLoadingAppointment(false);
                return;
            }

            try {
                const res = await fetch(`/api/appointments/${appointmentId}`, {
                    headers: withAuthHeaders(),
                });

                if (!res.ok) throw new Error("โหลด appointment ไม่ได้");

                const j = await res.json();
                const data = j.data || j;

                setAppointment(data);
            } catch (err) {
                console.error(err);
                message.error("โหลดข้อมูลนัดหมายไม่สำเร็จ");
            } finally {
                setLoadingAppointment(false);
            }
        };

        loadAppointment();
    }, [appointmentId]);

    // 🔥 submit
    const onFinish = async (values: any) => {
        if (!appointment) {
            message.error("ไม่พบข้อมูล appointment");
            return;
        }

        setLoading(true);

        const payload = {
            ...values,
            date: values.date.format("YYYY-MM-DD"),
            patient_id: appointment.patient_id, // ✅ ดึงจาก appointment
        };

        try {
            message.loading({ content: "กำลังบันทึก...", key: "save" });

            // ✅ 1. create inspection
            const res = await fetch("/api/inspection_records", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...withAuthHeaders(),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Create inspection failed");

            const json = await res.json();
            const newInspection = json.data || json;

            // ✅ 2. update appointment (connect inspection)
            if (appointmentId) {
                const res2 = await fetch(`/api/appointments/${appointmentId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...withAuthHeaders(),
                    },
                    body: JSON.stringify({
                        inspection_record_id:
                            newInspection.inspection_record_id,
                    }),
                });

                if (!res2.ok) throw new Error("Update appointment failed");
            }

            message.success({ content: "สร้างบันทึกสำเร็จ", key: "save" });

            router.back();
        } catch (err) {
            console.error(err);
            message.error({ content: "ไม่สามารถบันทึกได้", key: "save" });
        } finally {
            setLoading(false);
        }
    };

    // 🔄 loading appointment
    if (loadingAppointment) {
        return <Spin style={{ display: "block", margin: "100px auto" }} />;
    }

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

                {/* 🔥 แสดงข้อมูล appointment */}
                {appointment && (
                    <Card style={{ marginBottom: 16, background: "#fafafa" }}>
                        <Text strong>ข้อมูลการนัด</Text>
                        <br />
                        <Text> วันที่: {dayjs(appointment.appointment_date).format("YYYY-MM-DD")}</Text>
                        <br />
                        <Text>
                            เวลา:{" "}
                            {appointment?.appointment_time
                                ? dayjs(appointment.appointment_time).isValid()
                                    ? dayjs(appointment.appointment_time).format("HH:mm")
                                    : dayjs(`1970-01-01T${appointment.appointment_time}`).format("HH:mm")
                                : "-"}
                        </Text>
                        <br />
                        <Text>ประเภท: {appointment.type}</Text>
                    </Card>
                )}

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
                            <Button onClick={() => router.back()}>ยกเลิก</Button>

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