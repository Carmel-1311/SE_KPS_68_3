"use client";
import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Form, Input, DatePicker, InputNumber, Button, Typography, Breadcrumb, Card, message, Row, Col } from "antd";
import { HomeOutlined, FileAddOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Remove mockMobileDentals local import
export default function RequestServicePage() {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const onFinish = async (values: { date: Dayjs; count: number; address: string }) => {
        setSubmitting(true);

        try {
            const payload = {
                date: values.date ? values.date.format('YYYY-MM-DD') : "",
                count: values.count || 0,
                address: values.address || "",
            };

            const res = await fetch("/api/mobile_dentals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to create request");

            message.success('ส่งคำขอรับบริการออกหน่วยสำเร็จ!');
            form.resetFields();
            router.push('/company/status');

        } catch (err) {
            console.error(err);
            message.error("เกิดข้อผิดพลาด โปรดลองอีกครั้ง");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ padding: "24px", maxWidth: 1000, margin: '0 auto' }}>
            <Breadcrumb
                style={{ marginBottom: 16 }}
                items={[
                    {
                        title: <Link href="/company"><HomeOutlined /> หน้าหลัก</Link>,
                    },
                    {
                        title: <><FileAddOutlined /> เพิ่มการนัดหมาย</>,
                    },
                ]}
            />

            <Card title={<Title level={3} style={{ margin: 0 }}>เพิ่มการนัดหมายออกหน่วยตรวจฟัน</Title>} variant="borderless" style={{ borderRadius: 12 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                    กรุณากรอกข้อมูลให้ครบถ้วนเพื่อความรวดเร็วในการประสานงานและการพิจารณาอนุมัติ
                </Text>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="วันที่ต้องการรับบริการ (date)"
                                name="date"
                                rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    size="large"
                                    format="YYYY-MM-DD"
                                    disabledDate={(current) => {
                                        return current && current < dayjs().startOf('day');
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="จำนวนผู้ป่วย (count)"
                                name="count"
                                rules={[{ required: true, message: 'กรุณาระบุจำนวนคน' }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={1} placeholder="ระบุจำนวนคน" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="สถานที่ออกหน่วย (address)"
                        name="address"
                        rules={[{ required: true, message: 'กรุณาระบุสถานที่' }]}
                    >
                        <TextArea rows={4} placeholder="ระบุ บ้านเลขที่, อาคาร, ชั้น, ถนน, เขต, จังหวัด, รหัสไปรษณีย์" size="large" />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginTop: 32 }}>
                        <Button size="large" onClick={() => form.resetFields()} style={{ marginRight: 8 }}>
                            ล้างข้อมูล
                        </Button>
                        <Button type="primary" htmlType="submit" size="large" loading={submitting}>
                            ส่งคำขอรับบริการ
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
