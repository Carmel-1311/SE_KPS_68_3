"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    Table,
    Form,
    Input,
    DatePicker,
    Button,
    Typography,
    Breadcrumb,
    Card,
    message,
    Modal,
    Space,
    Upload,
    Popconfirm
} from "antd";
import {
    HomeOutlined,
    UnorderedListOutlined,
    UserAddOutlined,
    TeamOutlined,
    UploadOutlined
} from "@ant-design/icons";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { UploadProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { withAuthHeaders } from "@/app/utils/auth.client";

const { Title, Text } = Typography;

type PatientResponse = {
    patient_id: number;
    name: string;
    birthday?: string;
    phone?: string;
    idcard?: string;
};

type Mission = {
    mobile_dental_id: string;
    company_name: string;
    date: string;
    address?: string;
};

interface PatientFormValues {
    first_name: string;
    last_name: string;
    birthday: dayjs.Dayjs;
    phone: string;
    idcard: string;
}

export default function PatientsPage() {
    const params = useParams();
    const mobileDentalId = params.id as string;

    const [patients, setPatients] = useState<PatientResponse[]>([]);
    const [mission, setMission] = useState<Mission | null>(null);

    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewPatient, setViewPatient] = useState<PatientResponse | null>(null);
    const [editingPatient, setEditingPatient] = useState<PatientResponse | null>(null);

    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [searchText, setSearchText] = useState("");

    const filteredPatients = patients.filter(p =>
        p.name?.toLowerCase().includes(searchText.toLowerCase()) ?? false
    );

    const [form] = Form.useForm();

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/mobile-dental/${mobileDentalId}/patients`, {
                cache: "no-store",
                headers: withAuthHeaders()
            });

            if (!res.ok) throw new Error();

            const json = await res.json();
            setPatients(json.data || []);

        } catch {
            message.error("โหลดรายชื่อผู้รับบริการไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [mobileDentalId]);

    const fetchMission = useCallback(async () => {
        try {
            const res = await fetch(`/api/mobile_dentals/${mobileDentalId}`, {
                headers: withAuthHeaders()
            });

            if (!res.ok) throw new Error();

            const json = await res.json();

            setMission({
                mobile_dental_id: String(json.data.mobile_dental_id),
                company_name: `บริษัท (ID: ${json.data.company_id})`,
                date: json.data.date,
                address: json.data.address
            });

        } catch {
            console.error("load mission failed");
        }
    }, [mobileDentalId]);

    useEffect(() => {
        fetchPatients();
        fetchMission();
    }, [fetchPatients, fetchMission]);

    const handleDelete = (patientId: number) => {
        setPatients(prev => prev.filter(p => p.patient_id !== patientId));
        message.success("ลบผู้ป่วยออกจากรายการแล้ว");
    };

    const handleEdit = (patient: PatientResponse) => {
        setEditingPatient(patient);

        const [first, ...rest] = patient.name.split(" ");
        const last = rest.join(" ");

        form.setFieldsValue({
            first_name: first,
            last_name: last,
            birthday: patient.birthday ? dayjs(patient.birthday) : undefined,
            phone: patient.phone,
            idcard: patient.idcard
        });

        setModalOpen(true);
    };

    const onFinish = async (values: PatientFormValues) => {
        setSubmitting(true);

        try {
            const payload = {
                first_name: values.first_name,
                last_name: values.last_name,
                birthday: dayjs(values.birthday).format("YYYY-MM-DD"),
                phone: values.phone,
                idcard: values.idcard
            };

            if (editingPatient) {
                setPatients(prev =>
                    prev.map(p =>
                        p.patient_id === editingPatient.patient_id
                            ? {
                                ...p,
                                name: `${values.first_name} ${values.last_name}`,
                                birthday: dayjs(values.birthday).format("YYYY-MM-DD"),
                                phone: values.phone,
                                idcard: values.idcard
                            }
                            : p
                    )
                );

                message.success("แก้ไขข้อมูลสำเร็จ");

            } else {
                const res = await fetch(
                    `/api/mobile-dental/${mobileDentalId}/patients`,
                    {
                        method: "POST",
                        headers: withAuthHeaders({ "Content-Type": "application/json" }),
                        body: JSON.stringify(payload)
                    }
                );

                if (!res.ok) throw new Error();

                message.success("เพิ่มรายชื่อผู้รับบริการสำเร็จ");
                fetchPatients();
            }

            form.resetFields();
            setModalOpen(false);
            setEditingPatient(null);

        } catch {
            message.error("บันทึกข้อมูลไม่สำเร็จ");
        } finally {
            setSubmitting(false);
        }
    };

    const uploadProps: UploadProps = {
        name: "file",
        beforeUpload: () => false,
        onChange(info) {
            setUploading(true);

            setTimeout(() => {
                setUploading(false);
                message.success(`${info.file.name} อัปโหลดสำเร็จ (จำลอง)`);
            }, 1500);
        }
    };

    const columns: ColumnsType<PatientResponse> = [
        {
            title: "ลำดับ",
            key: "index",
            render: (_, __, idx) => idx + 1,
            width: 70
        },
        {
            title: "ชื่อ-นามสกุล",
            dataIndex: "name"
        },
        {
            title: "การจัดการ",
            key: "action",
            width: 220,
            render: (_, record) => (
                <Space>

                    <Button type="link" onClick={() => setViewPatient(record)}>
                        ดูข้อมูล
                    </Button>

                    <Button type="link" onClick={() => handleEdit(record)}>
                        แก้ไข
                    </Button>

                    <Popconfirm
                        title="ยืนยันการลบ"
                        onConfirm={() => handleDelete(record.patient_id)}
                    >
                        <Button danger type="link">
                            ลบ
                        </Button>
                    </Popconfirm>

                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>

            <Breadcrumb
                style={{ marginBottom: 16 }}
                items={[
                    {
                        title: (
                            <Link href="/company">
                                <HomeOutlined /> หน้าหลัก
                            </Link>
                        )
                    },
                    {
                        title: (
                            <Link href="/company/status">
                                <UnorderedListOutlined /> ตรวจสอบสถานะ
                            </Link>
                        )
                    },
                    {
                        title: (
                            <>
                                <TeamOutlined /> รายชื่อผู้รับบริการ
                            </>
                        )
                    }
                ]}
            />

            <Card
                title={
                    <Space orientation="vertical">
                        <Title level={3} style={{ margin: 0 }}>
                            ผู้รับบริการตรวจนอกสถานที่
                        </Title>

                        {mission && (
                            <Text type="secondary">
                                คำขอ #{mission.mobile_dental_id} | วันที่ {mission.date} | {mission.address}
                            </Text>
                        )}

                        <Text>
                            จำนวนผู้รับบริการ: <b>{patients.length}</b> คน
                        </Text>
                    </Space>
                }
                variant="borderless"
                style={{ borderRadius: 12 }}
                extra={
                    <Space>
                        <Input
                            placeholder="ค้นหาชื่อผู้ป่วย"
                            allowClear
                            style={{ width: 200 }}
                            onChange={(e) => setSearchText(e.target.value)}
                        />

                        <Upload {...uploadProps} showUploadList={false}>
                            <Button icon={<UploadOutlined />} loading={uploading}>
                                นำเข้าจาก Excel
                            </Button>
                        </Upload>

                        <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={() => setModalOpen(true)}
                        >
                            เพิ่มรายบุคคล
                        </Button>
                    </Space>
                }
            >

                <Table
                    dataSource={filteredPatients}
                    columns={columns}
                    rowKey="patient_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />

            </Card>

            <Modal
                title="เพิ่ม / แก้ไขผู้รับบริการ"
                open={modalOpen}
                footer={null}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                    setEditingPatient(null);
                }}
            >

                <Form form={form} layout="vertical" onFinish={onFinish}>

                    <Form.Item
                        label="ชื่อ"
                        name="first_name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="นามสกุล"
                        name="last_name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="วันเกิด"
                        name="birthday"
                        rules={[{ required: true }]}
                    >
                        <DatePicker style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        label="เบอร์โทร"
                        name="phone"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="เลขบัตรประชาชน"
                        name="idcard"
                        rules={[
                            { required: true },
                            { pattern: /^[0-9]{13}$/, message: "เลขบัตรต้อง 13 หลัก" }
                        ]}
                    >
                        <Input maxLength={13} />
                    </Form.Item>

                    <Form.Item style={{ textAlign: "right" }}>
                        <Button htmlType="submit" type="primary" loading={submitting}>
                            บันทึก
                        </Button>
                    </Form.Item>

                </Form>

            </Modal>

            <Modal
                open={!!viewPatient}
                title="ข้อมูลผู้รับบริการ"
                footer={null}
                onCancel={() => setViewPatient(null)}
            >

                {viewPatient && (
                    <Space orientation="vertical">

                        <Text><b>ชื่อ:</b> {viewPatient.name}</Text>
                        <Text><b>วันเกิด:</b> {viewPatient.birthday || "-"}</Text>
                        <Text><b>เบอร์โทร:</b> {viewPatient.phone || "-"}</Text>
                        <Text><b>เลขบัตร:</b> {viewPatient.idcard || "-"}</Text>

                    </Space>
                )}

            </Modal>

        </div>
    );
}
