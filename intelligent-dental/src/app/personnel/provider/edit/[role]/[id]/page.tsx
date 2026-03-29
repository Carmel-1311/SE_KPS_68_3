"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
    Divider,
    Breadcrumb
} from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";
import { message } from "antd";
import { usePatientById } from "@/hook/usePatientById";
import { useCompanyById } from "@/hook/useCompanyById";
import { useStaffById } from "@/hook/useStaffById";

import { useUpdatePatients } from "@/hook/useUpdeatPatients";
import { useUpdateStaff } from "@/hook/useUpdeatStaffs";
import { useUpdateCompany } from "@/hook/useUpdateCompany";

const { Title, Text } = Typography;
type Role = "patient" | "dentist" | "staff" | "company";

function useProviderResource(role: Role, id: number) {
    const patientGet = usePatientById(id);
    const staffGet = useStaffById(id);
    // const companyGet = useCompanyById(id);

    const patientUpdate = useUpdatePatients();
    const staffUpdate = useUpdateStaff();
    // const companyUpdate = useUpdateCompany();

    if (role === "patient") {
        return {
            data: patientGet.patients,
            loading: patientGet.loading,
            update: patientUpdate.updatePatients,
            updating: patientUpdate.loading
        };
    }

    // if (role === "company") {
    //     return {
    //         data: companyGet.company,
    //         loading: companyGet.loading,
    //         update: companyUpdate.updateCompany,
    //         updating: companyUpdate.loading
    //     };
    // }

    return {
        data: staffGet.staffs,
        loading: staffGet.loading,
        update: staffUpdate.updateStaff,
        updating: staffUpdate.loading
    };
}

function mapResponseToForm(role: Role, data: any) {
    if (!data) return {};

    // if (role === "company") {
    //     return {
    //         office_name: data.office_name,
    //         contact_name: data.contact_name,
    //         phone: data.phone,
    //         address: data.address
    //     };
    // }

    const parts = data.name?.trim().split(/\s+/) ?? [];


    let prefix = "";
    let first_name = "";
    let last_name = "";

    if (parts.length === 1) {
        first_name = parts[0];
    } else if (parts.length === 2) {
        first_name = parts[0];
        last_name = parts[1];
    } else if (parts.length >= 3) {
        // assume first part = prefix
        prefix = parts[0];
        first_name = parts[1];
        last_name = parts.slice(2).join(" ");
    }
    if (role === "patient") {
        return {
            first_name: first_name,
            last_name: last_name,
            phone: data.phone,
            email: data.email,
            birthday: data.birthday ? dayjs(data.birthday) : null,
            allergy: data.allergy
        };
    }
    return {
        prefix: prefix,
        first_name: first_name,
        last_name: last_name,
        phone: data.phone,
        birthday: data.birthday ? dayjs(data.birthday) : null,
        license_number: data.license_number,
        position: data.position
    };
}

export default function ProviderEditPage() {
    const params = useParams();
    const role = params.role as Role;
    const id = Number(params.id);
    const router = useRouter();
    const [form] = Form.useForm();

    const { data, loading, update, updating } = useProviderResource(role, id);

    useEffect(() => {
        if (!data) return;
        form.setFieldsValue(mapResponseToForm(role, data));
    }, [data, role]);



    const onFinish = async (values: any) => {
        await update(id, {
            ...values,
            birthday: values.birthday?.format("YYYY-MM-DD")
        });

        message.success("บันทึกสำเร็จ");

        setTimeout(() => {
            router.push(`/personnel/provider/detail/${role}/${id}`);
        }, 800);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", padding: 40 }}>
            <div style={{ width: 720 }}>
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
                        { title: "แก้ไขข้อมูลผู้ใช้" }
                    ]}
                />

                <Card
                    loading={loading}
                    style={{
                        borderRadius: 14,
                        boxShadow: "0 6px 30px rgba(0,0,0,0.08)"
                    }}
                >
                    <Title level={4}>แก้ไขข้อมูลผู้ใช้</Title>
                    <Text type="secondary">แก้ไขข้อมูลพื้นฐานของผู้ใช้งาน</Text>

                    <Divider />

                    <Form layout="vertical" form={form} onFinish={onFinish}>

                        {role !== "company" && (
                            <Row gutter={16}>
                                {role !== "patient" && (
                                    <Col span={6}>
                                        <Form.Item name="prefix" label="คำนำหน้า">
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                )}

                                <Col span={role === "patient" ? 12 : 9}>
                                    <Form.Item name="first_name" label="ชื่อ" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>

                                <Col span={role === "patient" ? 12 : 9}>
                                    <Form.Item name="last_name" label="นามสกุล" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}

                        {role !== "company" && (
                            <Form.Item name="birthday" label="วันเกิด">
                                <DatePicker style={{ width: "100%" }} />
                            </Form.Item>
                        )}

                        {/* {role === "company" && (
                            <>
                                <Form.Item name="office_name" label="ชื่อบริษัท" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="contact_name" label="ผู้ติดต่อ">
                                    <Input />
                                </Form.Item>
                            </>
                        )} */}

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="phone" label="เบอร์" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item name="email" label="อีเมล">
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                        {role === "patient" && (
                            <Form.Item name="allergy" label="แพ้ยา">
                                <Input />
                            </Form.Item>
                        )}

                        {role === "dentist" && (
                            <Form.Item name="license_number" label="เลขใบประกอบ">
                                <Input />
                            </Form.Item>
                        )}

                        {/* {role === "company" && (
                            <Form.Item name="address" label="ที่อยู่">
                                <Input.TextArea rows={3} />
                            </Form.Item>
                        )} */}

                        <Divider />

                        <Form.Item>
                            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                                <Button onClick={() => router.back()}>ยกเลิก</Button>
                                <Button type="primary" htmlType="submit" loading={updating}>
                                    บันทึก
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
}