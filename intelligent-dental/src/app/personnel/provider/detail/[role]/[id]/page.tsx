"use client";

import {
    Breadcrumb,
    Button,
    Card,
    Descriptions,
    Space,
    Typography,
    Tag,
} from "antd";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { usePatientById } from "@/hook/usePatientById";
import { useCompanyById } from "@/hook/useCompanyById";
import { useStaffById } from "@/hook/useStaffById";
type Role = "patient" | "dentist" | "staff" | "company";

interface User {
    id: string;
    name?: string;
    role: Role;
    phone: string;
    email?: string;
    allergy?: string;
    licenseNumber?: string;
    position?: string;
    officeName?: string;
    contactName?: string;
    address?: string;
}

export default function ProviderDetailPage() {
    const { Title, Text } = Typography;
    const router = useRouter();
    const params = useParams();

    const role = params.role as Role;
    const id = Number(params.id);

    const { patients, loading: patientLoading } = usePatientById(id);
    const { staffs, loading: staffLoading } = useStaffById(id);
    const { company, loading: companyLoading } = useCompanyById(id);

    const loading =
        role === "patient"
            ? patientLoading
            : role === "company"
                ? companyLoading
                : staffLoading;

    const rawUser =
        role === "patient"
            ? patients
            : role === "company"
                ? company
                : staffs;



    const user: any | null = (() => {
        if (!rawUser) return null;

        if (role === "company") {
            const c = rawUser as any;
            return {
                id: rawUser.id,
                role: "company",
                officeName: c.office_name ?? "",
                phone: rawUser.phone,
                email: rawUser.email,
                contactName: c.contact_name ?? "",
                address: c.address ?? "",
            };
        }
        const c = rawUser as any;
        return {
            id: rawUser.id,
            role: role,
            name: c.name,
            phone: rawUser.phone,
            email: rawUser.email,
            allergy: c.allergy ?? "",
            licenseNumber: c.license_number ?? "",
        };
    })();

    const roleLabel = {
        patient: "ผู้ป่วย",
        dentist: "ทันตแพทย์",
        staff: "พนักงาน",
        company: "หน่วยงานภายนอก",
    };
    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>ไม่พบข้อมูล</div>;
    }
    return (

        <div style={{ padding: 24 }}>
            {/* Breadcrumb */}

            <Breadcrumb
                style={{ marginBottom: 24 }}
                items={[
                    {
                        title: (
                            <a onClick={() => router.push("/")}>
                                <HomeOutlined /> หน้าหลัก
                            </a>
                        ),
                    },
                    {
                        title: (
                            <a onClick={() => router.push("/personnel/provider")}>
                                <UserOutlined /> ข้อมูลผู้ใช้
                            </a>
                        ),
                    },
                    { title: "รายละเอียดผู้ใช้" },
                ]}
            />

            <Card
                style={{
                    borderRadius: 12,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                }}
            >
                <Space orientation="vertical" style={{ width: "100%" }} size={24}>
                    {/* HEADER */}

                    <Space
                        style={{
                            width: "100%",
                            justifyContent: "space-between",
                        }}
                    >
                        <div>
                            <Title level={4} style={{ margin: 0 }}>
                                {user.name}
                            </Title>

                            <Text type="secondary">
                                <Tag color="blue">{roleLabel[role]}</Tag>
                            </Text>
                        </div>

                        <Space>
                            <Button
                                onClick={() => router.push("/personnel/provider")}
                            >
                                กลับ
                            </Button>
                            {role === "patient" && (
                                <Button
                                    onClick={() =>
                                        router.push(`/personnel/provider/change-role/${id}`)
                                    }
                                >
                                    แก้ไขบทบาท
                                </Button>
                            )}
                            {role != "company" && (
                                <Button
                                    type="primary"
                                    onClick={() =>
                                        router.push(
                                            `/personnel/provider/edit/${role}/${id}`
                                        )
                                    }
                                >
                                    แก้ไขข้อมูล
                                </Button>)}

                        </Space>
                    </Space>

                    <Descriptions bordered column={2}>
                        {/* DETAIL */}
                        {role != "company" && (
                            <Descriptions.Item label="ชื่อ - นามสกุล">
                                {user.name}
                            </Descriptions.Item>
                        )}

                        {role === "company" && (
                            <Descriptions.Item label="ชื่อบริษัท">
                                {user.officeName}
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label="เบอร์โทรศัพท์">
                            {user.phone}
                        </Descriptions.Item>

                        {user.email && (
                            <Descriptions.Item label="อีเมล">
                                {user.email}
                            </Descriptions.Item>
                        )}

                        {/* ROLE FIELD */}

                        {role === "patient" && (
                            <Descriptions.Item label="ข้อมูลการแพ้ยา">
                                {user.allergy}
                            </Descriptions.Item>
                        )}

                        {role === "dentist" && (
                            <Descriptions.Item label="เลขใบประกอบวิชาชีพ">
                                {user.licenseNumber}
                            </Descriptions.Item>
                        )}

                        {/* {role === "staff" && (
                            <Descriptions.Item label="ตำแหน่ง">
                                {user.position}
                            </Descriptions.Item>
                        )} */}

                        {role === "company" && (
                            <>
                                <Descriptions.Item label="ชื่อผู้ติดต่อ">
                                    {user.contactName}
                                </Descriptions.Item>

                                <Descriptions.Item label="ที่อยู่" span={2}>
                                    {user.address}
                                </Descriptions.Item>
                            </>
                        )}
                    </Descriptions>
                </Space>
            </Card>
        </div >
    );
}