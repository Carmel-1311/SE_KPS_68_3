"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getCurrentCompanyId } from "@/mock/mockUser";
import {
    Table,
    Tag,
    Typography,
    Breadcrumb,
    Card,
    Button,
    Tabs,
    message,
    Popconfirm,
    Input,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    HomeOutlined,
    UnorderedListOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

const { Title } = Typography;

type MobileDentalStatus =
    | "request"
    | "scheduled"
    | "request_cancel"
    | "cancel"
    | "completed";

type MobileDental = {
    mobile_dental_id: number;
    company_id: number;
    address: string;
    date: string;
    count: number;
    status: MobileDentalStatus;
};

export default function RequestsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("1");
    const [requests, setRequests] = useState<MobileDental[]>([]);
    const [loading, setLoading] = useState(false);
    const [cancelingId, setCancelingId] = useState<number | null>(null);
    const [searchText, setSearchText] = useState("");

    const companyId = getCurrentCompanyId() ?? 1;

    const filteredRequests = requests.filter((item) => {
        if (!searchText) return true;

        return (
            item.mobile_dental_id.toString().includes(searchText) ||
            item.address?.toLowerCase().includes(searchText.toLowerCase())
        );
    });

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);

            const res = await fetch(
                `/api/mobile_dentals?company_id=${companyId}`,
                { cache: "no-store" }
            );

            if (!res.ok) throw new Error("Fetch failed");

            const data = await res.json();
            setRequests(data.data || []);
        } catch {
            message.error("โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleCancelRequest = async (id: number) => {
        try {
            setCancelingId(id);

            const res = await fetch(`/api/mobile_dentals/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "request_cancel" }),
            });

            if (!res.ok) throw new Error("Cancel failed");

            message.success("ส่งคำขอยกเลิกแล้ว รอผู้ดูแลระบบยืนยัน");

            await fetchRequests();
        } catch {
            message.error("ยกเลิกคำขอไม่สำเร็จ");
        } finally {
            setCancelingId(null);
        }
    };
    console.log(requests)
    const handleUndoCancelRequest = async (id: number) => {
        try {
            setCancelingId(id);

            const res = await fetch(`/api/mobile_dentals/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "request" }),
            });

            if (!res.ok) throw new Error("Undo cancel failed");

            message.success("ยกเลิกคำขอยกเลิกเรียบร้อยแล้ว");

            await fetchRequests();
        } catch {
            message.error("ยกเลิกคำขอยกเลิกไม่สำเร็จ");
        } finally {
            setCancelingId(null);
        }
    };

    const statusMap: Record<
        MobileDentalStatus,
        { color: string; text: string }
    > = {
        request: { color: "blue", text: "ส่งคำขอแล้ว" },
        scheduled: { color: "green", text: "นัดหมายแล้ว" },
        request_cancel: { color: "orange", text: "แจ้งขอยกเลิก" },
        cancel: { color: "red", text: "ยกเลิกแล้ว" },
        completed: { color: "default", text: "เสร็จสิ้น" },
    };

    const columns: ColumnsType<MobileDental> = [
        {
            title: "รหัสคำขอ",
            dataIndex: "mobile_dental_id",
            key: "mobile_dental_id",
            width: 100,
        },
        {
            title: "สถานที่ขอบริการ",
            dataIndex: "address",
            key: "address",
            render: (address: string) => (
                <Typography.Text>{address || "-"}</Typography.Text>
            ),
        },
        {
            title: "วันที่รับบริการ",
            dataIndex: "date",
            key: "date",
            width: 120,
        },
        {
            title: "ผู้รับบริการ (คน)",
            dataIndex: "count",
            key: "count",
            width: 150,
            align: "center",
        },
        {
            title: "สถานะ",
            dataIndex: "status",
            key: "status",
            width: 150,
            render: (status: MobileDentalStatus) => {
                const s = statusMap[status] || { color: "default", text: status };
                return <Tag color={s.color}>{s.text.toUpperCase()}</Tag>;
            },
        },
        {
            title: "จัดการ",
            key: "action",
            width: 250,
            align: "center",
            render: (_, record) => {
                if (record.status === "cancel") return null;

                if (record.status === "request_cancel") {
                    return (
                        <Popconfirm
                            title="ยืนยันการยกเลิกคำขอยกเลิก"
                            description="ต้องการยกเลิกคำขอยกเลิกนี้ใช่หรือไม่?"
                            okText="ยืนยัน"
                            cancelText="ไม่"
                            onConfirm={() =>
                                handleUndoCancelRequest(record.mobile_dental_id)
                            }
                        >
                            <Button
                                type="link"
                                loading={cancelingId === record.mobile_dental_id}
                            >
                                ยกเลิกคำขอยกเลิก
                            </Button>
                        </Popconfirm>
                    );
                }

                if (record.status === "request") {
                    return (
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                justifyContent: "center",
                            }}
                        >
                            <Button type="text" disabled style={{ color: "#ccc" }}>
                                รอการนัดหมาย
                            </Button>

                            <Popconfirm
                                title="ยืนยันการยกเลิก"
                                okText="ยืนยัน"
                                cancelText="ยกเลิก"
                                onConfirm={() =>
                                    handleCancelRequest(record.mobile_dental_id)
                                }
                            >
                                <Button
                                    danger
                                    type="text"
                                    loading={cancelingId === record.mobile_dental_id}
                                >
                                    ยกเลิกคำขอ
                                </Button>
                            </Popconfirm>
                        </div>
                    );
                }

                if (record.status === "scheduled") {
                    return (
                        <Button
                            type="primary"
                            icon={<TeamOutlined />}
                            onClick={() =>
                                router.push(
                                    `/company/status/${record.mobile_dental_id}/patients`
                                )
                            }
                        >
                            ส่งรายชื่อผู้รับบริการ
                        </Button>
                    );
                }

                return (
                    <Button
                        icon={<TeamOutlined />}
                        onClick={() =>
                            router.push(
                                `/company/status/${record.mobile_dental_id}/patients`
                            )
                        }
                    >
                        ดูรายชื่อ
                    </Button>
                );
            },
        },
    ];

    const pendingRequests = filteredRequests.filter(
        (d) => d.status === "request" || d.status === "request_cancel"
    );

    const scheduledRequests = filteredRequests.filter(
        (d) => d.status === "scheduled"
    );

    const otherRequests = filteredRequests.filter(
        (d) =>
            d.status === "cancel" ||
            d.status === "completed"
    );

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
                        ),
                    },
                    {
                        title: (
                            <>
                                <UnorderedListOutlined /> ตรวจสอบสถานะ
                            </>
                        ),
                    },
                ]}
            />

            <Card
                title={
                    <Title level={3} style={{ margin: 0 }}>
                        ตรวจสอบสถานะการรับบริการออกหน่วย
                    </Title>
                }
                extra={
                    <Input
                        placeholder="ค้นหาด้วยรหัสคำขอ หรือ สถานที่"
                        allowClear
                        style={{ width: 250 }}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                }
                variant="borderless"
                style={{ borderRadius: 12 }}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: "1",
                            label: "รอดำเนินการ",
                            children: (
                                <Table
                                    loading={loading}
                                    dataSource={pendingRequests}
                                    columns={columns}
                                    rowKey="mobile_dental_id"
                                    pagination={{ pageSize: 10 }}
                                />
                            ),
                        },
                        {
                            key: "2",
                            label: "นัดหมายแล้ว",
                            children: (
                                <Table
                                    loading={loading}
                                    dataSource={scheduledRequests}
                                    columns={columns}
                                    rowKey="mobile_dental_id"
                                    pagination={{ pageSize: 10 }}
                                />
                            ),
                        },
                        {
                            key: "3",
                            label: "ประวัติอื่นๆ"
                            ,
                            children: (
                                <Table
                                    loading={loading}
                                    dataSource={otherRequests}
                                    columns={columns}
                                    rowKey="mobile_dental_id"
                                    pagination={{ pageSize: 10 }}
                                />
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    );
}