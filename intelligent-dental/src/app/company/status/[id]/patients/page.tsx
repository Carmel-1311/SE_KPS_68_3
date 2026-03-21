"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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
    Popconfirm,
    Space,
    Tooltip,
    Upload,
} from "antd";
import {
    TeamOutlined,
    UploadOutlined,
    SaveOutlined,
    UserAddOutlined
} from "@ant-design/icons";
import { BookOpenText, Pencil, Trash2, SearchCheck, House } from "lucide-react";
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
    target_count: number;
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
    const filteredPatients = useMemo(() => {
        return patients.filter(p =>
            p.name?.toLowerCase().includes(searchText.toLowerCase()) ?? false
        );
    }, [patients, searchText]);

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
                address: json.data.address,
                target_count: json.data.count || 0
            });

        } catch {
            console.error("load mission failed");
        }
    }, [mobileDentalId]);

    useEffect(() => {
        fetchPatients();
        fetchMission();
    }, [fetchPatients, fetchMission]);

    const handleDelete = useCallback((patientId: number) => {
        setPatients(prev => prev.filter(p => p.patient_id !== patientId));
        message.success("ลบผู้ป่วยออกจากรายการแล้ว");
    }, []);

    const handleEdit = useCallback((patient: PatientResponse) => {
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
    }, [form]);

    const onFinish = useCallback(async (values: PatientFormValues) => {
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
                // Validation: Check if exceeding target count
                if (mission && patients.length >= mission.target_count) {
                    message.error(`ไม่สามารถเพิ่มรายชื่อได้ เนื่องจากจำนวนผู้รับบริการเกินกำหนด (${mission.target_count} คน)`);
                    return;
                }

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
    }, [editingPatient, mobileDentalId, fetchPatients, form, mission, patients]);

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

    const columns: ColumnsType<PatientResponse> = useMemo(() => [
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
                <Space size="middle">
                    <Tooltip title="ดูข้อมูล">
                        <BookOpenText
                            size={18}
                            style={{ cursor: "pointer", color: "#1890ff" }}
                            onClick={() => setViewPatient(record)}
                        />
                    </Tooltip>

                    <Tooltip title="แก้ไข">
                        <Pencil
                            size={18}
                            style={{ cursor: "pointer", color: "#faad14" }}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="ยืนยันการลบ"
                        description="ต้องการลบผู้ป่วยรายนี้ใช่หรือไม่?"
                        okText="ยืนยัน"
                        cancelText="ยกเลิก"
                        onConfirm={() => handleDelete(record.patient_id)}
                    >
                        <Tooltip title="ลบข้อมูล">
                            <Trash2
                                size={18}
                                style={{ cursor: "pointer", color: "#ff4d4f" }}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ], [handleEdit, handleDelete]);

    return (
        <div style={{ padding: 24 }}>

            <Breadcrumb
                style={{ marginBottom: 16 }}
                items={[
                    {
                        title: (
                            <Link href="/company" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'inherit' }}>
                                <House size={16} />
                                <span>หน้าหลัก</span>
                            </Link>
                        )
                    },
                    {
                        title: (
                            <Link href="/company/status" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'inherit' }}>
                                <SearchCheck size={16} />
                                <span>ตรวจสอบสถานะ</span>
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
                    pagination={{
                        pageSize: 15,
                        showSizeChanger: false,
                    }}
                    sticky={{ offsetHeader: 1 }}
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
                        <Button htmlType="submit" type="primary" loading={submitting} icon={<SaveOutlined />}>
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
