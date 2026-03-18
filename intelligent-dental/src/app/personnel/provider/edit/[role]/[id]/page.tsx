"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Button,
    Card,
    Form,
    Input,
    Col,
    Row,
    DatePicker,
    Space,
    Typography,
    Divider
} from "antd";
import dayjs from "dayjs";
import { Breadcrumb } from "antd";
import Link from "next/link";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";
const { Title, Text } = Typography;

type Role = "patient" | "dentist" | "staff" | "company";

export default function ProviderEditPage() {
    const params = useParams();

    const role = params.role as Role;
    const id = Number(params.id);

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const mockData: any = {
        patient: {
            name: "สมชาย ใจดี",
            phone: "0811111111",
            email: "test@mail.com",
            allergy: "Penicillin",
            birthday: "1990-01-01"
        },
        dentist: {
            prefix: "ทพ.",
            name: "สมเกียรติ แพทย์ดี",
            phone: "0822222222",
            license_number: "DEN1234",
            birthday: "1990-01-01"
        },
        staff: {
            name: "ศิริพร ดีมาก",
            phone: "0833333333",
            position: "Assistant",
            birthday: "1990-01-01"
        },
        company: {
            office_name: "Dental Company",
            contact_name: "บาบา",
            phone: "0999999999",
            address: "สยาม 11212"
        }
    };

    const loadUser = () => {
        const data = mockData[role];
        if (!data) return;

        let firstName = "";
        let lastName = "";

        if (role !== "company") {
            const parts = data.name?.split(" ") ?? [];
            firstName = parts[0] ?? "";
            lastName = parts.slice(1).join(" ");
        }

        form.setFieldsValue({
            first_name: firstName,
            last_name: lastName,
            phone: data.phone,
            email: data.email,
            birthday: data.birthday ? dayjs(data.birthday) : null,
            prefix: data.prefix,
            allergy: data.allergy,
            license_number: data.license_number,
            position: data.position,
            office_name: data.office_name,
            contact_name: data.contact_name,
            address: data.address
        });
    };

    useEffect(() => {
        loadUser();
    }, [role, id]);

    const onFinish = (values: any) => {
        setLoading(true);

        const payload = {
            ...values,
            birthday: values.birthday?.format("YYYY-MM-DD")
        };

        console.log("submit:", payload);

        setTimeout(() => {
            setLoading(false);
        }, 800);
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                padding: 40,
            }}
        ><div style={{ width: 720 }}>
                <Breadcrumb
                    style={{ marginBottom: 24 }}
                    items={[
                        {
                            title: (
                                <Link href="/">
                                    <HomeOutlined /> หน้าหลัก
                                </Link>
                            )
                        },
                        {
                            title: (
                                <Link href="/personnel/provider">
                                    <UserOutlined /> ข้อมูลผู้ใช้
                                </Link>
                            )
                        },
                        {
                            title: "แก้ไขข้อมูลผู้ใช้"
                        }
                    ]}
                />

                <Card
                    style={{
                        width: 720,
                        borderRadius: 14,
                        boxShadow: "0 6px 30px rgba(0,0,0,0.08)"
                    }}
                >
                    <Title level={4} style={{ marginBottom: 4 }}>
                        แก้ไขข้อมูลผู้ใช้
                    </Title>

                    <Text type="secondary">
                        แก้ไขข้อมูลพื้นฐานของผู้ใช้งานในระบบ
                    </Text>

                    <Divider />

                    <Form layout="vertical" form={form} onFinish={onFinish}>

                        {/* NAME */}

                        {role !== "company" && (
                            <Row gutter={16}>
                                {role !== "patient" && (
                                    <Col span={6}>
                                        <Form.Item name="prefix" label="คำนำหน้า">
                                            <Input placeholder="เช่น ทพ." />
                                        </Form.Item>
                                    </Col>
                                )}

                                <Col span={role === "patient" ? 12 : 9}>
                                    <Form.Item
                                        name="first_name"
                                        label="ชื่อ"
                                        rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
                                    >
                                        <Input placeholder="ชื่อ" />
                                    </Form.Item>
                                </Col>

                                <Col span={role === "patient" ? 12 : 9}>
                                    <Form.Item
                                        name="last_name"
                                        label="นามสกุล"
                                        rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
                                    >
                                        <Input placeholder="นามสกุล" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}

                        {/* Birthday */}

                        {role !== "company" && (
                            <Form.Item name="birthday" label="วันเกิด">
                                <DatePicker style={{ width: "100%" }} />
                            </Form.Item>
                        )}

                        {/* COMPANY */}

                        {role === "company" && (
                            <>
                                <Form.Item
                                    name="office_name"
                                    label="ชื่อบริษัท"
                                    rules={[{ required: true, message: "กรุณากรอกชื่อบริษัท" }]}
                                >
                                    <Input placeholder="ชื่อบริษัท" />
                                </Form.Item>

                                <Form.Item name="contact_name" label="ชื่อผู้ติดต่อ">
                                    <Input placeholder="ชื่อผู้ติดต่อ" />
                                </Form.Item>
                            </>
                        )}

                        {/* CONTACT */}

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="phone"
                                    label="เบอร์โทร"
                                    rules={[{ required: true, message: "กรุณากรอกเบอร์โทร" }]}
                                >
                                    <Input placeholder="08xxxxxxxx" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item name="email" label="อีเมล">
                                    <Input placeholder="example@email.com" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* ROLE FIELDS */}

                        {role === "patient" && (
                            <Form.Item name="allergy" label="ข้อมูลแพ้ยา">
                                <Input placeholder="เช่น Penicillin" />
                            </Form.Item>
                        )}

                        {role === "dentist" && (
                            <Form.Item
                                name="license_number"
                                label="เลขใบประกอบวิชาชีพ"
                            >
                                <Input placeholder="DEN12345" />
                            </Form.Item>
                        )}

                        {role === "company" && (
                            <Form.Item name="address" label="ที่อยู่">
                                <Input.TextArea rows={3} />
                            </Form.Item>
                        )}

                        <Divider />

                        {/* ACTION BUTTON */}

                        <Form.Item>
                            <Space
                                style={{
                                    width: "100%",
                                    justifyContent: "flex-end"
                                }}
                            >
                                <Button>ยกเลิก</Button>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                >
                                    บันทึกข้อมูล
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Card>
            </div></div>
    );
}