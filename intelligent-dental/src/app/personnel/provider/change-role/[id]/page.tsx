"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Card,
    Form,
    Input,
    Button,
    Select,
    Typography,
    Space,
    DatePicker,
    Breadcrumb
} from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";
import { usePatientById } from "@/hook/usePatientById";
import { useChangePatientRole } from "@/hook/useChangePatientRole";
const { Title } = Typography;

export default function ChangeRolePage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const { patients, loading: patientLoading } = usePatientById(id);

    const [form] = Form.useForm();
    const [role, setRole] = useState<"staff" | "dentist">("staff");

    const { changeRole, loading: changeLoading } = useChangePatientRole();
    // ✅ set ค่าเดิม (readonly)
    useEffect(() => {
        if (!patients) return;

        const parts = patients.name?.split(" ") ?? [];

        form.setFieldsValue({
            first_name: parts[0] ?? "",
            last_name: parts.slice(1).join(" "),
            phone: patients.phone,
            birthday: patients.birthday ? dayjs(patients.birthday) : null
        });
    }, [patients]);

    const onFinish = async (values: any) => {
    const success = await changeRole(id, {
        role,
        prefix: values.prefix,
        license_number: values.license_number
    });

    if (success) {
        router.push(`/personnel/provider`);
    }
};

    if (patientLoading) return <div>Loading...</div>;

    return (
         <div style={{ padding: 24 }}>
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
                        { title: "แก้ไขบทบาทผู้ใช้" }
                    ]}
                />
        <Card style={{ maxWidth: 600, margin: "40px auto" }}>
            <Title level={4}>เปลี่ยน บทบาท</Title>

            <Form layout="vertical" form={form} onFinish={onFinish}>
                {/* SELECT ROLE */}
                <Form.Item label="เลือก บทบาทผู้ใช้">
                    <Select
                        value={role}
                        onChange={(val) => setRole(val)}
                        options={[
                            { label: "พนักงาน", value: "staff" },
                            { label: "ทันตแพทย์", value: "dentist" }
                        ]}
                    />
                </Form.Item>
                <Form.Item name="prefix" label="คำนำหน้า" rules={[{ required: true }]}>
                    <Input placeholder="เช่น นาย / นาง / ทพ." />
                </Form.Item>
                {/* READONLY DATA */}

                <Form.Item name="first_name" label="ชื่อ">
                    <Input disabled />
                </Form.Item>

                <Form.Item name="last_name" label="นามสกุล">
                    <Input disabled />
                </Form.Item>

                <Form.Item name="phone" label="เบอร์">
                    <Input disabled />
                </Form.Item>

                <Form.Item name="birthday" label="วันเกิด">
                    <DatePicker style={{ width: "100%" }} disabled />
                </Form.Item>

                {role === "dentist" && (
                    <Form.Item
                        name="license_number"
                        label="เลขใบประกอบวิชาชีพ"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="DEN12345" />
                    </Form.Item>
                )}

                <Space>
                    <Button onClick={() => router.back()}>ยกเลิก</Button>
                    <Button loading={changeLoading} type="primary" htmlType="submit">
                        บันทึก
                    </Button>
                </Space>
            </Form>
        </Card></div>
    );
}